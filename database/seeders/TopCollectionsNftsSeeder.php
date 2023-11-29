<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\Chain;
use App\Enums\TokenType;
use App\Models\Collection as NftCollection;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Network;
use App\Models\Token;
use App\Models\User;
use App\Support\Facades\Alchemy;
use App\Support\Web3NftHandler;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection as IlluminateCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use JsonMachine\Exception\InvalidArgumentException;
use JsonMachine\Items;
use JsonMachine\JsonDecoder\ExtJsonDecoder;

class TopCollectionsNftsSeeder extends Seeder
{
    const nftsSubDir = 'collection-nfts';

    const diskName = 'live-dump';

    public function run(): void
    {
        $collections = $this->getTopCollections();

        foreach ($collections as $key => $collection) {
            $chain = $collection->chain;

            /** @var Network $network */
            $network = Network::query()->where('chain_id', $chain->value)->first();

            /** @var Token $nativeToken */
            $nativeToken = Token::query()
                ->where('symbol', $collection->price_symbol)
                ->where('network_id', $network->id)
                ->first();

            $collectionModel = $this->createCollection($network, $nativeToken, $collection);

            $nfts = $this->loadCollectionNfts($collection, $chain);

            if (empty($nfts)) {
                continue;
            }

            $collectionTraits = $this->loadCollectionTraits($collection, $chain);

            // Add traits
            $traitsChunk = collect();

            foreach ($collectionTraits as $trait) {
                if (! CollectionTrait::isValidValue($trait['value'])) {
                    continue;
                }

                $traitsChunk->push([
                    'collection_id' => $collectionModel->id,
                    'name' => $trait['name'],
                    'value' => $trait['value'],
                    'value_max' => $trait['valueMin'],
                    'value_min' => $trait['valueMax'],
                    'display_type' => $trait['displayType'],
                    'nfts_count' => $trait['nftsCount'],
                    'nfts_percentage' => $trait['nftsPercentage'],
                ]);

                if ($traitsChunk->count() % (int) config('dashbrd.seeder_traits_chunk_size') === 0) {
                    CollectionTrait::query()->insertOrIgnore($traitsChunk->toArray());
                    $traitsChunk = collect();
                }
            }

            if ($traitsChunk->isNotEmpty()) {
                CollectionTrait::query()->insertOrIgnore($traitsChunk->toArray());
            }

            $nftsChunk = collect();

            foreach ($nfts as $nftData) {
                $nftsChunk->push(Alchemy::parseNft($nftData, $network->id));

                if ($nftsChunk->count() % (int) config('dashbrd.seeder_nfts_chunk_size') === 0) {
                    $this->storeNftsAndTraits($nftsChunk, $collectionModel);
                    $nftsChunk = collect();
                }
            }

            // insert remaining NFTs if there are any
            if ($nftsChunk->isNotEmpty()) {
                $this->storeNftsAndTraits($nftsChunk, $collectionModel);
            }
        }

        Collection::updateFiatValue();

        User::updateCollectionsValue();
    }

    private function getTopCollections(int $limit = 25): IlluminateCollection
    {
        $fs = Storage::disk(self::diskName);
        $ethCollections = json_decode($fs->get(self::nftsSubDir.'/top-eth-collections.json'));
        $polygonCollections = json_decode($fs->get(self::nftsSubDir.'/top-polygon-collections.json'));

        $ethCollections = collect($ethCollections->data)
            ->filter(fn ($collection) => $collection->items_total <= 20000)
            ->map(function ($collection) {
                $collection->chain = Chain::from(1);

                return $collection;
            })
            ->values()
            ->chunk($limit)
            ->first();

        $polygonCollections = collect($polygonCollections->data)
            ->filter(fn ($collection) => $collection->items_total <= 20000)
            ->map(function ($collection) {
                $collection->chain = Chain::from(137);

                return $collection;
            })
            ->values()
            ->chunk($limit)
            ->first();

        return $ethCollections->merge($polygonCollections);
    }

    private function createCollection(
        Network $network,
        Token $token,
        object $collection
    ): NftCollection {
        NftCollection::query()->insertOrIgnore([
            'address' => $collection->contract_address,
            'network_id' => $network->id,
            'name' => trim($collection->name),
            'description' => $collection->description ? trim($collection->description) : null,
            'slug' => Str::slug($collection->name),
            'symbol' => $collection->symbol ?? $collection->name,
            'floor_price' => $collection->floor_price * 1e18,
            'floor_price_token_id' => $token->id,
            'volume' => $collection->volume_total,
            'supply' => $collection->items_total,
            'type' => $collection->erc_type === 'erc721' ? TokenType::Erc721->value : TokenType::Erc1155->value,
            'minted_block' => $collection->deploy_block_number,
            'extra_attributes' => json_encode([
                'image' => $collection->logo_url ?? $collection->featured_url,
                'website' => $collection->website,
            ]),
            'created_at' => Carbon::now(),
        ]);

        /** @var NftCollection $collectionModel */
        $collectionModel = NftCollection::query()
            ->where('address', $collection->contract_address)
            ->where('network_id', $network->id)
            ->first();

        return $collectionModel;
    }

    private function loadCollectionNfts(object $collection, Chain $chain): array|Items
    {
        $address = $collection->contract_address;
        $path = $this->prepareCollectionPath($chain, $address);

        $fs = Storage::disk(self::diskName);

        $fileName = $path.'/nfts.json';

        if (! $fs->exists($fileName)) {
            return [];
        }

        $nftsFile = $fs->path($fileName);

        try {
            return Items::fromFile($nftsFile, ['decoder' => new ExtJsonDecoder(true)]);
        } catch (InvalidArgumentException $e) {
            Log::info("Couldn't open json file for seeding", [
                'message' => $e->getMessage(),
                'collectionAddress' => $address,
                'fileName' => $nftsFile,
            ]);

            return [];
        }
    }

    private function loadCollectionTraits(object $collection, Chain $chain): array
    {
        $address = $collection->contract_address;
        $path = $this->prepareCollectionPath($chain, $address);

        $fs = Storage::disk(self::diskName);

        $fileName = $path.'/traits.json';

        if (! $fs->exists($fileName)) {
            return [];
        }

        return json_decode($fs->get($fileName), true);
    }

    private function prepareCollectionPath(Chain $chain, string $contractAddress): string
    {
        return self::nftsSubDir.'/'.Str::lower($chain->name).'_'.$contractAddress;
    }

    private function storeNftsAndTraits(IlluminateCollection $parsedNfts, NftCollection $collection): void
    {
        $nftsChunk = $parsedNfts->map(fn ($parsedNft) => [
            'collection_id' => $collection->id,
            'wallet_id' => null,
            'token_number' => $parsedNft->tokenNumber,
            'name' => $parsedNft->name,
            'extra_attributes' => json_encode($parsedNft->extraAttributes),
            'created_at' => Carbon::now(),
        ]);

        DB::transaction(function () use ($nftsChunk, $collection, $parsedNfts) {
            $collection->nfts()->insertOrIgnore($nftsChunk->toArray());

            (new Web3NftHandler())->upsertTraits(
                $parsedNfts,
                collect([Str::lower($parsedNfts[0]->tokenAddress) => $collection]),
                Carbon::now()
            );
        });
    }
}
