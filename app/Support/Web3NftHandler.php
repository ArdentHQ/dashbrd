<?php

declare(strict_types=1);

namespace App\Support;

use App\Data\Web3\Web3NftData;
use App\Enums\Features;
use App\Jobs\DetermineCollectionMintingDate;
use App\Jobs\FetchCollectionFloorPrice;
use App\Models\Collection as CollectionModel;
use App\Models\CollectionTrait;
use App\Models\Network;
use App\Models\Nft;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\GalleryNftsChanged;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Pennant\Feature;
use RuntimeException;

class Web3NftHandler
{
    public static string $numericTraitPlaceholder = '-';

    private bool $persistLastIndexedTokenNumber = false;

    public function __construct(
        private ?Wallet $wallet = null,
        private ?Network $network = null,
        private ?CollectionModel $collection = null,
    ) {
        //
    }

    /**
     * @param  Collection<int, Web3NftData>  $nfts
     */
    public function store(Collection $nfts, bool $dispatchJobs = false): void
    {
        $now = Carbon::now();

        $nftsInCollection = collect($nfts)->groupBy('tokenAddress');

        $nftsGroupedByCollectionAddress = $nftsInCollection->map->first();

        $collectionsData = $nftsGroupedByCollectionAddress->flatMap(function (Web3NftData $nftData) use ($now, $nftsInCollection) {
            $token = $nftData->token();

            $attributes = [
                'image' => $nftData->collectionImage,
                'website' => $nftData->collectionWebsite,
                'socials' => $nftData->collectionSocials,
                'banner' => $nftData->collectionBannerImageUrl,
                'banner_updated_at' => $nftData->collectionBannerImageUrl ? $now : null,
            ];

            if ($nftData->collectionOpenSeaSlug !== null) {
                $attributes['opensea_slug'] = $nftData->collectionOpenSeaSlug;
            }

            if ($nftData->hasError) {
                $attributes = array_filter($attributes, function ($value) {
                    return $value !== null;
                });
            }

            return [
                $nftData->tokenAddress,
                $nftData->networkId,
                trim($nftData->collectionName),
                $this->getSlug($nftData->collectionName),
                $nftData->collectionSymbol,
                $nftData->collectionDescription !== null ? strip_tags($nftData->collectionDescription) : null,
                $nftData->collectionSupply,
                $token ? $nftData->floorPrice?->price : null,
                $token?->id,
                $token ? $nftData->floorPrice?->retrievedAt : null,
                json_encode($attributes),
                $nftData->mintedBlock,
                $nftData->mintedAt?->toDateTimeString(),
                $this->lastRetrievedTokenNumber($nftsInCollection->get($nftData->tokenAddress)),
                $now,
                $now,
            ];
        });

        $valuesPlaceholders = $nftsGroupedByCollectionAddress->map(fn () => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')->join(',');

        $ids = DB::transaction(function () use ($nfts, $collectionsData, $valuesPlaceholders, $dispatchJobs, $now) {
            // upsert nfts/collections (if any)
            if ($nfts->isEmpty()) {
                return collect();
            }

            $dbCollections = collect(DB::select(
                // language=postgresql
                "
    insert into collections
        (address, network_id, name, slug, symbol, description, supply, floor_price, floor_price_token_id, floor_price_retrieved_at, extra_attributes, minted_block, minted_at, last_indexed_token_number, created_at, updated_at)
    values {$valuesPlaceholders}
    on conflict (address, network_id) do update
        set name = trim(coalesce(excluded.name, collections.name)),
            symbol = coalesce(excluded.symbol, collections.symbol),
            description = coalesce(excluded.description, collections.description),
            supply = coalesce(excluded.supply, collections.supply),
            floor_price_token_id = coalesce(excluded.floor_price_token_id, collections.floor_price_token_id),
            floor_price_retrieved_at = coalesce(excluded.floor_price_retrieved_at, collections.floor_price_retrieved_at),
            extra_attributes = coalesce(collections.extra_attributes::jsonb, '{}') || excluded.extra_attributes::jsonb,
            minted_block = excluded.minted_block,
            minted_at = excluded.minted_at,
            last_indexed_token_number = coalesce(excluded.last_indexed_token_number, collections.last_indexed_token_number)
    returning id, address, floor_price, supply
     ",
                $collectionsData->toArray(),
            ));

            // Group all NFTs by their address, so the key will be the address of the collection
            $groupedByAddress = collect($dbCollections)->keyBy(fn ($nft) => Str::lower($nft->address));

            $nfts = $nfts->filter(function ($nft) use ($groupedByAddress) {
                $collection = $groupedByAddress->get(Str::lower($nft->tokenAddress));

                return $this->shouldKeepNft($collection);
            });

            $valuesToUpsert = $nfts->map(function ($nft) use ($groupedByAddress, $now) {
                $collection = $groupedByAddress->get(Str::lower($nft->tokenAddress));

                $values = [
                    'wallet_id' => $this->wallet?->id,
                    'collection_id' => $collection->id,
                    'token_number' => $nft->tokenNumber,
                    'description' => $nft->description,
                    'name' => $nft->name,
                    'extra_attributes' => json_encode($nft->extraAttributes),
                    'deleted_at' => null,
                    'metadata_fetched_at' => $now,
                    'info' => $nft->hasError ? $nft->info : null,
                ];

                return $values;
            })->toArray();

            $uniqueBy = ['collection_id', 'token_number'];

            $valuesToUpdateIfExists = ['deleted_at', 'info'];
            $valuesToCheck = ['name', 'description', 'extra_attributes', 'metadata_fetched_at', 'wallet_id'];

            foreach ($valuesToCheck as $value) {
                if (array_filter($valuesToUpsert, fn ($v) => $v[$value] !== null)) {
                    $valuesToUpdateIfExists[] = $value;
                }
            }

            Nft::upsert($valuesToUpsert, $uniqueBy, $valuesToUpdateIfExists);

            // Traits only need if collections are enabled
            if (Feature::active(Features::Collections->value)) {
                $this->upsertTraits($nfts, $groupedByAddress, $now);
            }

            $ids = $dbCollections->pluck('id');

            if ($dispatchJobs) {
                $groupedByAddress
                    ->each(function ($dbCollection, string $address) {
                        if (! empty($dbCollection->floor_price)) {
                            return;
                        }

                        FetchCollectionFloorPrice::dispatch($this->getChainId(), $address)
                                ->onQueue(Queues::NFTS)
                                ->afterCommit();
                    });
            }

            return $ids;
        });

        if (Feature::active(Features::Collections->value)) {
            $nftsGroupedByCollectionAddress->filter(fn (Web3NftData $nft) => $nft->mintedAt === null)->each(function (Web3NftData $nft) {
                DetermineCollectionMintingDate::dispatch($nft)->onQueue(Queues::NFTS);
            });

            // Passing an empty array means we update all collections which is undesired here.
            if (! $ids->isEmpty()) {
                CollectionModel::updateFiatValue($ids->toArray());
            } else {
                Log::info('Web3NftHandler: skipping updateFiatValue because no ids given', [
                    'wallet' => $this->wallet?->address,
                    'collectionId' => $this->collection?->id,
                    'chainId' => $this->getChainId(),
                ]);
            }

            // Users that own NFTs from the collections that were updated
            $affectedUsersIds = User::whereHas('wallets', function (Builder $walletQuery) use ($ids) {
                $walletQuery->whereHas('nfts', function (Builder $nftQuery) use ($ids) {
                    $nftQuery->whereIn('collection_id', $ids);
                });
            })->pluck('users.id')->toArray();

            // Passing an empty array means we update all users which is undesired here.
            if (! empty($affectedUsersIds)) {
                User::updateCollectionsValue($affectedUsersIds);
            } else {
                Log::info('Web3NftHandler: skipping updateCollectionsValue because no user affected', [
                    'wallet' => $this->wallet?->address,
                    'collectionId' => $this->collection?->id,
                    'chainId' => $this->getChainId(),
                ]);
            }
        }
    }

    /**
     * @param object{
     *   supply: int|null
     * } $collection
     */
    private function shouldKeepNft(object $collection): bool
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
            return $this->network->chain_id;
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
        if ($this->wallet->isLocalTestingAddress()) {
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
            function ($address) use ($network, $lastUpdateTimestamp) {
                $query = Nft::where('wallet_id', $this->wallet->id)
                ->whereHas('collection', function (Builder $query) use ($address, $network) {
                    $query->where('network_id', $network->id)
                        ->where('address', $address);
                })
                ->where('updated_at', '<', $lastUpdateTimestamp);

                /** @var array<int, array{'token_number': string, 'collection_id': int, 'name': string, 'updated_at': string}> $nftsToBeUnassigned */
                $nftsToBeUnassigned = $query->clone()->select('token_number', 'collection_id', 'name', 'updated_at')->get()->toArray();
                if (count($nftsToBeUnassigned) > 0) {
                    // Log the NFTs that were not updated
                    Log::debug('No longer owned NFTs', [
                        'wallet' => $this->wallet->address,
                        'lastUpdateTimestamp' => $lastUpdateTimestamp,
                        'nfts' => $nftsToBeUnassigned,
                    ]);

                    // Notify
                    Notification::route('slack', config('dashbrd.gallery.logs.slack_webhook_url'))->notify(
                        (new GalleryNftsChanged($this->wallet->address, $nftsToBeUnassigned))->onQueue(Queues::DEFAULT)
                    );
                }

                // Unassign NFTs that were not updated as they are no longer owned
                $query->update(['wallet_id' => null]);
            }
        );

        // Empty galleries are deleted via trigger (see `2023_03_29_080204_create_prune_galleries_trigger.php`)
    }

    private function getSlug(string $name): string
    {
        $slugOptions = (new CollectionModel)->getSlugOptions();

        return Str::slug($name, $slugOptions->slugSeparator, $slugOptions->slugLanguage);
    }
}
