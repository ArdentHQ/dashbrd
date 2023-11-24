<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\Chain;
use App\Models\Collection as NftCollection;
use App\Models\Network;
use App\Models\Token;
use App\Support\Facades\Alchemy;
use App\Support\Facades\Mnemonic;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection as IlluminateCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use stdClass;

class LiveDumpNfts extends Command
{
    const COLLECTION_LIMIT = 100;

    const nftsSubDir = 'collection-nfts';

    const diskName = 'live-dump';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:live-dump  {--collection-index=} {--chain-id=} {--start-chunk-index=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create NFT dump for popular collections';

    /**
     * @var array<mixed>
     */
    protected $requiredAttributes = [
        'name',
        'description',
        'tokenId',
        'contract' => [
            'address',
            'symbol',
            'name',
            'totalSupply',
            'openSeaMetadata' => ['twitterUsername', 'discordUrl', 'floorPrice', 'collectionName', 'imageUrl', 'externalUrl', 'description'],
            'deployedBlockNumber',
        ],
        'image' => [
            'thumbnailUrl', 'cachedUrl', 'originalUrl'
        ],
        'raw' => [
            'metadata' => [
                'image',
                'attributes',
                'properties',
                'external_url',
            ],
        ]
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (app()->isProduction()) {
            $this->error('This job is to run non-production environments only.');

            return Command::INVALID;
        }

        $index = $this->option('collection-index');

        if ($index === null) {
            $this->error('Please provide a valid collection index. A number between 0 and '.(self::COLLECTION_LIMIT - 1));

            return Command::INVALID;
        }

        $chain = Chain::from($this->option('chain-id') === null ? 1 : (int) $this->option('chain-id'));

        $topCollections = $this->getTopCollections($chain, self::COLLECTION_LIMIT);

        if (empty($topCollections[$index])) {
            $this->error('There is no collection at the given index. The index should be less than '.self::COLLECTION_LIMIT);

            return Command::INVALID;
        }

        $collection = (object) $topCollections[$index];

        $contractAddress = $collection->contract_address;

        $startChunkIndex = (int) $this->option('start-chunk-index');
        $cursor = null;

        if ($startChunkIndex !== 0) {
            $cursor = $this->getTokenCursorForChunk($startChunkIndex, $chain, $contractAddress);

            if ($cursor === null) {
                $this->error("Couldn't find chunk file with the given index.");

                return Command::INVALID;
            }
        }

        $collectionModel = $this->prepareCollectionModel($chain, $collection);

        $this->getCollectionNftsAndPersist(
            $collectionModel,
            $chain,
            $collection->items_total,
            $startChunkIndex,
            $cursor,
        );

        $this->mergeNftChunks($chain, $contractAddress);

        $this->getCollectionTraitsAndPersist($chain, $contractAddress);

        return Command::SUCCESS;
    }

    private function prepareCollectionModel(Chain $chain, stdClass $collection): NftCollection
    {
        $network = Network::firstWhere('chain_id', $chain->value);

        $token = Token::query()
            ->where('symbol', $collection->price_symbol)
            ->where('network_id', $network->id)
            ->first();

        return new NftCollection([
            'address' => $collection->contract_address,
            'network_id' => $network->id,
            'name' => trim($collection->name),
            'slug' => Str::slug($collection->name),
            'symbol' => $collection->symbol ?? $collection->name,
            'floor_price' => $collection->floor_price * 1e18,
            'floor_price_token_id' => $token->id,
            'extra_attributes' => json_encode([
                'image' => $collection->logo_url ?? $collection->featured_url,
                'website' => $collection->website,
            ]),
            'created_at' => Carbon::now(),
        ]);
    }

    /**
     * @return IlluminateCollection<int, array<string, mixed>> $collections
     */
    private function getTopCollections(Chain $chain, int $limit = 25): IlluminateCollection
    {
        $chainName = strtolower($chain->name);
        $fileName = self::nftsSubDir."/top-{$chainName}-collections.json";

        $fs = Storage::disk(self::diskName);

        /** @var array{data: array<array<string, mixed>>} $collections */
        $collections = json_decode($fs->get($fileName), true);

        /** @var IlluminateCollection<int, array<string, mixed>> $collections */
        $collections = collect($collections['data'])
            ->filter(fn ($collection) => $collection['items_total'] <= 20000)
            ->values()
            ->chunk($limit)
            ->first();

        return $collections;
    }

    /**
     * @param  array<mixed>  $nft
     * @return array<mixed>
     */
    private function removeEncodedAttributes(array $nft): array
    {
        $potentiallyEncodedAttributes = [
            'image.thumbnailUrl',
            'image.cachedUrl',
            'image.originalUrl',
            'raw.metadata.image',
        ];

        foreach ($potentiallyEncodedAttributes as $attribute) {
            $value = Arr::get($nft, $attribute);
            if ($value !== null && isBase64EncodedImage($value)) {
                Arr::set($nft, $attribute, null);
            }
        }

        return $nft;
    }

    /**
     * @param  array<mixed>  $nft
     * @return array<mixed>
     */
    private function filterNftAttributes(array $nft): array
    {
        return $this->removeEncodedAttributes(filterAttributes($nft, $this->requiredAttributes));
    }

    private function getCollectionNftsAndPersist(
        NftCollection $collection,
        Chain $chain,
        int $itemsTotal,
        int $chunk,
        string $cursor = null,
    ): void {
        $perChunkLimit = 100;

        $fs = Storage::disk(self::diskName);

        $path = $this->prepareCollectionPath($chain, $collection->address).'/nft-chunks/';

        $humanReadableChunk = $chunk === 0 ? 0 : $chunk + 1;
        $progressBar = $this->output->createProgressBar($itemsTotal - $humanReadableChunk * $perChunkLimit);

        do {
            $this->info('Processing chunk: '.$chunk);

            $data = Alchemy::collectionNftsRaw($collection, $cursor);

            $data['nfts'] = array_map(fn ($nft) => $this->filterNftAttributes($nft), $data['nfts']);

            $fileName = $path.$chunk.'.json';

            $fs->put($fileName, (string) json_encode($data, JSON_PRETTY_PRINT));

            $progressBar->advance($perChunkLimit);

            $cursor = Arr::get($data, 'nextToken');

            $chunk++;
        } while ($cursor !== null);

        $progressBar->finish();
    }

    private function mergeNftChunks(Chain $chain, string $contractAddress): void
    {
        $fs = Storage::disk(self::diskName);

        $path = $this->prepareCollectionPath($chain, $contractAddress);

        $nfts = [];

        $chunks = $fs->allFiles("{$path}/nft-chunks");

        foreach ($chunks as $chunk) {
            $nftsChunk = json_decode($fs->get($chunk));
            $nfts = array_merge($nfts, $nftsChunk->nfts);
        }

        $fileName = $path.'/nfts.json';
        $fs->put($fileName, (string) json_encode($nfts));

        $this->info('Merged NFT chunks, file: '.$fileName);
        $this->info('Total NFTs count: '.count($nfts));
    }

    private function prepareCollectionPath(Chain $chain, string $contractAddress): string
    {
        return self::nftsSubDir.'/'.Str::lower($chain->name).'_'.$contractAddress;
    }

    private function getTokenCursorForChunk(int $chunk, Chain $chain, string $contractAddress): ?string
    {
        $path = $this->prepareCollectionPath($chain, $contractAddress);

        $fs = Storage::disk(self::diskName);

        $file = $fs->get("{$path}/nft-chunks/{$chunk}.json");

        if (! $file) {
            return null;
        }

        $nftChunk = json_decode($file, true);

        return Arr::get($nftChunk, 'pageKey');
    }

    private function getCollectionTraitsAndPersist(Chain $chain, string $address): void
    {
        $this->info('Fetching collection traits...');

        $fs = Storage::disk(self::diskName);

        $traits = Mnemonic::getNftCollectionTraits($chain, $address);

        $path = $this->prepareCollectionPath($chain, $address);

        $fileName = $path.'/traits.json';

        $fs->put($fileName, (string) json_encode($traits, JSON_PRETTY_PRINT));

        $this->info('Fetched collection traits, file: '.$fileName);
    }
}
