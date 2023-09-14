<?php

declare(strict_types=1);

namespace App\Support;

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
use App\Data\Web3\Web3NftData;
use App\Enums\Features;
use App\Jobs\DetermineCollectionMintingDate;
use App\Jobs\FetchCollectionFloorPrice;
use App\Models\Collection as CollectionModel;
use App\Models\CollectionTrait;
use App\Models\Network;
use App\Models\Nft;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Pennant\Feature;
use RuntimeException;

class Web3NftHandler
{
    public static string $numericTraitPlaceholder = '-';

    private bool $persistLastIndexedTokenNumber = false;

    public function __construct(
        private ?WalletData $wallet = null,
        private ?NetworkData $network = null,
        private ?CollectionModel $collection = null,
    ) {
        //
    }

    /**
     * @param  Collection<int, Web3NftData>  $nfts
     */
    public function store(Collection $nfts): void
    {
        if ($nfts->isEmpty()) {
            return;
        }

        $now = Carbon::now();

        $nftsInCollection = collect($nfts)->groupBy(fn ($nft) => Str::lower($nft->tokenAddress));

        $collectionsData = $nftsInCollection->map->first()->map(function (Web3NftData $nft) use ($now, $nftsInCollection) {
            $token = $nft->token();

            return [
                'address' => $nft->tokenAddress,
                'network_id' => $nft->networkId,
                'name' => trim($nft->collectionName),
                'slug' => $this->getSlug($nft->collectionName),
                'symbol' => $nft->collectionSymbol,
                'description' => $nft->collectionDescription !== null ? strip_tags($nft->collectionDescription) : null,
                'supply' => $nft->collectionSupply,
                'floor_price' => $token ? $nft->floorPrice?->price : null,
                'floor_price_token_id' => $token?->id,
                'floor_price_retrieved_at' => $token ? $nft->floorPrice?->retrievedAt : null,
                'extra_attributes' => json_encode([
                    'image' => $nft->collectionImage,
                    'website' => $nft->collectionWebsite,
                    'socials' => $nft->collectionSocials,
                    'banner' => $nft->collectionBannerImageUrl,
                    'banner_updated_at' => $nft->collectionBannerImageUrl ? $now : null,
                ]),
                'minted_block' => $nft->mintedBlock,
                'minted_at' => $nft->mintedAt?->toDateTimeString(),
                'last_indexed_token_number' => $this->lastRetrievedTokenNumber($nftsInCollection->get(Str::lower($nft->tokenAddress))),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        });

        /** @var string[] $columns */
        $columns = array_keys($collectionsData->first());

        unset($columns['network_id']);
        unset($columns['address']);

        // We take all the columns (except the ones we unique on which are network_id and address)
        // and generate `column = coalesce(excluded.column, collections.column)` for UPSERT...
        $update = collect($columns)->mapWithKeys(fn ($column) => [
            $column => DB::raw(sprintf('coalesce(excluded.%s, collections.%s)', $column, $column)),
        ])->all();

        $collections = DB::transaction(function () use ($nfts, $collectionsData, $update, $now) {
            /** @var EloquentCollection<int, CollectionModel> $collections */
            $collections = CollectionModel::upsertReturning(
                $collectionsData->toArray(), uniqueBy: ['address', 'network_id'], update: $update
            );

            /** @var EloquentCollection<string, CollectionModel> $collections */
            $collections = $collections->keyBy(fn (CollectionModel $collection) => Str::lower($collection->address));

            $nfts = $nfts->filter(
                fn ($nft) => $this->shouldKeepNft($collections[Str::lower($nft->tokenAddress)])
            );

            $valuesToUpdateIfExists = ['name', 'extra_attributes', 'deleted_at'];

            if ($this->wallet !== null) {
                $valuesToUpdateIfExists[] = 'wallet_id';
            }

            Nft::upsert($nfts->map(fn ($nft) => [
                'wallet_id' => $this->wallet?->id,
                'collection_id' => $collections->get(Str::lower($nft->tokenAddress))->id,
                'token_number' => $nft->tokenNumber,
                'name' => $nft->name,
                'extra_attributes' => json_encode($nft->extraAttributes),
                'deleted_at' => null,
            ])->toArray(), uniqueBy: ['collection_id', 'token_number'], update: $valuesToUpdateIfExists);

            // Traits only need if collections are enabled
            if (Feature::active(Features::Collections->value)) {
                $this->upsertTraits($nfts, $collections, $now);

                $collections->each(function ($collection) {
                    if ($collection->floor_price === null) {
                        FetchCollectionFloorPrice::dispatch($this->getChainId(), $collection->address)
                                ->afterCommit()
                                ->onQueue(Queues::NFTS);
                    }

                    if ($collection->minted_at === null) {
                        DetermineCollectionMintingDate::dispatch($collection)
                                ->afterCommit()
                                ->onQueue(Queues::NFTS);
                    }
                });
            }

            return $collections;
        });

        if (Feature::active(Features::Collections->value)) {
            CollectionModel::updateFiatValue($collections->modelKeys());

            // Users that own NFTs from the collections that were updated
            $affectedUsersIds = User::whereHas('wallets', function (Builder $query) use ($collections) {
                $query->whereHas('nfts', fn ($q) => $q->whereIn('collection_id', $collections->modelKeys()));
            })->pluck('users.id')->toArray();

            User::updateCollectionsValue($affectedUsersIds);
        }
    }

    private function shouldKeepNft(CollectionModel $collection): bool
    {
        // Dont ignore wallet NFTs
        if ($this->wallet !== null) {
            return true;
        }

        // Some collections do not report total supply, and it's safer to ignore them and not index potentially millions of NFTs...
        if ($collection->supply === null) {
            return false;
        }

        // If the supply is higher than the max cap, we'll ignore them...
        return $collection->supply <= config('dashbrd.collections_max_cap');
    }

    /**
     * Collection models store the last indexed NFT token number as a cursor which NFTs in a collection have already been indexed.
     *
     * Sometimes, you may want to toggle that. For example when fetching wallet MFTs as in that case, not all collection NFTs have been retrieved.
     */
    public function withPersistingLastIndexedTokenNumber(): self
    {
        $this->persistLastIndexedTokenNumber = true;

        return $this;
    }

    /**
     * @param  Collection<int, Web3NftData>  $nfts
     */
    private function lastRetrievedTokenNumber(Collection $nfts): ?string
    {
        return $this->persistLastIndexedTokenNumber
                        ? $nfts->max('tokenNumber')
                        : $this->collection?->last_indexed_token_number;
    }

    private function getChainId(): int
    {
        if ($this->collection) {
            return $this->collection->network->chain_id;
        }

        if ($this->network) {
            return $this->network->chainId;
        }

        throw new RuntimeException('Unable to determine chain id');
    }

    /**
     * @param  Collection<int, Web3NftData>  $nfts
     * @param  Collection<string, \App\Models\Collection>  $collectionLookup
     * NOTE: The caller is responsible for ensuring atomicity. Make sure to always call this inside a `DB::Transaction`.
     */
    public function upsertTraits(Collection $nfts, Collection $collectionLookup, Carbon $now): void
    {
        // We need the db trait ids and nft ids. Neither eloquent nor query builder is a good fit for this,
        // because it would result in many queries since we have to update 2 different trait tables.
        //
        // To minimize the number of queries we use raw queries which makes it so that we just need 2 queries
        // in total irrespective of how many NFTs/traits we get:
        //
        // 1) first insert all collection traits and return the ids (ignoring conflicts)
        // 2) lastly, insert rows into the nft_trait table
        //
        //
        // Given that this code is supposed to change rarely if at all so this shouldn't matter much this
        // should be a fine trade-off.
        //
        $allTraits = $nfts->flatMap(fn ($nft) => array_map(fn (array $trait) => [
            ...$trait,
            // NOTE: here we introduce a normalized value, which will be part of the composite index that identifies a
            // collection trait. this is only relevant for numeric traits since it does not make sense to consider
            // each different number a unique trait. Without this it is not possible to answer things like 'How many NFTs have this trait in common'.
            'normalizedValue' => $trait['displayType']->isNumeric() ? static::$numericTraitPlaceholder : $trait['value'],
            'collectionId' => $collectionLookup->get(Str::lower($nft->tokenAddress))->id,
            'tokenNumber' => $nft->tokenNumber,
        ], $nft->traits))
            ->filter(fn ($trait) => CollectionTrait::isValidValue($trait['value']));

        if ($allTraits->isEmpty()) {
            return;
        }

        $params = $allTraits->unique(fn ($trait) => '_'.$trait['collectionId'].'_'.$trait['name'].'_'.$trait['normalizedValue'])
            ->map(fn (array $trait) => [
                $trait['collectionId'],
                $trait['name'],
                $trait['normalizedValue'],
                $trait['displayType']->value,
                0,
                0,
                $now,
                $now,
            ]);

        $placeholders = $params->map(fn ($_) => '(?, ?, ?, ?, ?, ?, ?, ?)')->join(', ');

        $query = sprintf(
            get_query('nfts.insert_collection_traits'),
            $placeholders
        );

        $dbTraits = collect(DB::select($query, $params->flatten()->toArray()));

        // Now we have all trait ids and can prepare a query to update all nfts in one go.
        //
        // This looks complicated, but essentially we just fill arrays (think of each array as a column):
        // - to join the nft ids, we need 2 arrays where each element represents 1 NFT (collectionId, tokenNumber)
        // - a 3rd array stores all the trait ids which maps to a NFT at the corresponding index in the former arrays
        // - lastly, one array each for each value type column (string/numeric/date)
        //
        // all arrays are then turned into individual rows using the postgres `unnest()` function.
        $dbTraitLookup = $dbTraits->groupBy(fn ($trait) => '_'.$trait->collection_id.'_'.$trait->name.'_'.$trait->value);

        $paramsCollectionIds = collect();
        $paramsTokenNumbers = collect();
        $paramsTraitIds = collect();
        $paramsValueStrings = collect();
        $paramsValueNumerics = collect();
        $paramsValueDates = collect();

        $nfts->groupBy('collectionId')->each(function ($nfts) use ($dbTraitLookup, $collectionLookup, $paramsCollectionIds, $paramsTokenNumbers, $paramsTraitIds, $paramsValueStrings, $paramsValueNumerics, $paramsValueDates) {
            $nfts->each(function ($nft) use ($dbTraitLookup, $collectionLookup, $paramsCollectionIds, $paramsTokenNumbers, $paramsTraitIds, $paramsValueStrings, $paramsValueNumerics, $paramsValueDates) {
                $collectionId = $collectionLookup->get(Str::lower($nft->tokenAddress))->id;
                collect($nft->traits)->each(function ($trait) use ($nft, $collectionId, $dbTraitLookup, $paramsCollectionIds, $paramsTokenNumbers, $paramsTraitIds, $paramsValueStrings, $paramsValueNumerics, $paramsValueDates) {
                    $dbTrait = $dbTraitLookup->get('_'.$collectionId.'_'.$trait['name'].'_'.($trait['displayType']->isNumeric() ? static::$numericTraitPlaceholder : $trait['value']));

                    if ($dbTrait === null) {
                        return false;
                    }

                    $dbTrait = $dbTrait->firstOrfail();

                    // NOTE: these are all safe to insert since they are passed as bindings so PHP does the escaping.
                    $paramsCollectionIds->push($collectionId);
                    $paramsTokenNumbers->push($nft->tokenNumber);
                    $paramsTraitIds->push($dbTrait->id);

                    // Write the original value to the pivot table depending on the display type.
                    [$valueString, $valueNumeric, $valueDate] = $trait['displayType']->getValueColumns($trait['value']);
                    $paramsValueStrings->push($valueString !== null ? StringUtils::doubleQuote($valueString) : 'NULL');
                    $paramsValueNumerics->push($valueNumeric ?? 'NULL');
                    $paramsValueDates->push($valueDate ?? 'NULL');
                });
            });
        });

        $toArrayLiteral = static fn (Collection $values): string => '{'.implode(',', $values->toArray()).'}';

        DB::select(
            get_query('nfts.insert_nft_traits'),
            [
                $toArrayLiteral($paramsCollectionIds), $toArrayLiteral($paramsTokenNumbers), $toArrayLiteral($paramsTraitIds),
                $toArrayLiteral($paramsValueStrings), $toArrayLiteral($paramsValueNumerics), $toArrayLiteral($paramsValueDates),
            ],
        );
    }

    public function cleanupNftsAndGalleries(Carbon $lastUpdateTimestamp): void
    {
        // We skip cleanup for the LOCAL_TESTING_ADDRESS as it would cause the seeded NFTs to be removed.
        if ($this->wallet->isLocalTestingAddress) {
            return;
        }

        // Cleanup old nfts / galleries - that is those that are in the DB but now missing from $fetchedNfts.
        $ownedCollections = Nft::join('collections', 'nfts.collection_id', '=', 'collections.id')
            ->select('collections.address')
            ->where('wallet_id', $this->wallet->id)
            ->groupBy('collections.address')
            ->get(['collections.address']);

        $network = Network::where('chain_id', $this->getChainId())->firstOrFail();

        $ownedCollections->pluck('address')->each(
            fn ($address) => Nft::where('wallet_id', $this->wallet->id)
                ->whereHas('collection', function (Builder $query) use ($address, $network) {
                    $query->where('network_id', $network->id)
                        ->where('address', $address);
                })
                ->where('updated_at', '<', $lastUpdateTimestamp)
                ->update(['wallet_id' => null])
        );

        // Empty galleries are deleted via trigger (see `2023_03_29_080204_create_prune_galleries_trigger.php`)
    }

    private function getSlug(string $name): string
    {
        $slugOptions = (new CollectionModel)->getSlugOptions();

        return Str::slug($name, $slugOptions->slugSeparator, $slugOptions->slugLanguage);
    }
}
