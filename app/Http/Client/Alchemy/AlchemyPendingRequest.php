<?php

declare(strict_types=1);

namespace App\Http\Client\Alchemy;

use App\Data\Web3\Web3ContractMetadata;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftData;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\AlchemyChain;
use App\Enums\Chain;
use App\Enums\CryptoCurrencyDecimals;
use App\Enums\ImageSize;
use App\Enums\NftInfo;
use App\Enums\TokenType;
use App\Enums\TraitDisplayType;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
use App\Models\Wallet;
use App\Support\CryptoUtils;
use App\Support\NftImageUrl;
use Carbon\Carbon;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Http\Client\ConnectionException as LaravelConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use stdClass;
use Throwable;

// Feature matrix: https://docs.alchemy.com/reference/feature-support-by-chain

class AlchemyPendingRequest extends PendingRequest
{
    protected string $apiUrl;

    private static string $apiUrlPlaceholder = '{CHAIN-NETWORK}';

    private ?AlchemyChain $chain = null;

    /**
     * Create a new HTTP Client instance.
     *
     * @return void
     */
    public function __construct(Factory $factory = null)
    {
        parent::__construct($factory);

        // The placeholder is dynamically replaced at runtime when the chain is known.
        // example url: https://polygon-mainnet.g.alchemy.com/v2/demo-key
        $this->apiUrl = 'https://'.self::$apiUrlPlaceholder.'.g.alchemy.com/v2/';

        $this->options = [
            'headers' => [
                'Accepts' => 'application/json',
            ],
        ];
    }

    /**
     * Send the request to the given URL.
     *
     * @param  array<mixed>  $options
     *
     * @throws \Exception
     */
    public function send(string $method, string $path, array $options = []): Response
    {
        if (is_null($this->chain)) {
            throw new AlchemyUnknownChainException();
        }

        $url = $this->apiUrl;
        // Prepend api key
        $url = $url.config('services.alchemy.apps.'.$this->chain->value.'.key').'/';

        /** @var string */
        $url = Str::replace(self::$apiUrlPlaceholder, $this->chain->value, $url);

        $url = $url.$path;

        try {
            return parent::send($method, $url, $options);
        } catch (Throwable $e) {
            if ($e instanceof LaravelConnectionException || $e instanceof ServerException) {
                throw new ConnectionException('Alchemy', $url, $e->getCode());
            }

            if ($e instanceof ClientException && $e->getCode() === 429) {
                $retryAfter = $e->getResponse()->getHeader('Retry-After')[0] ?? 30;

                throw new RateLimitException((int) $retryAfter);
            }

            throw $e;
        }
    }

    /**
     * @see https://docs.alchemy.com/reference/alchemy-gettokenbalances
     *
     * @return Collection<int, Web3Erc20TokenData>
     */
    public function getWalletTokens(Wallet $wallet, Network $network): Collection
    {
        $this->chain = AlchemyChain::fromChainId($network->chain_id);

        $allTokens = collect();
        $allTokenBalances = collect();
        $pageKey = null;

        do {
            $data = self::post('', $this->payload(
                'alchemy_getTokenBalances',
                [
                    $wallet->address,
                    'erc20',
                    ['pageKey' => $pageKey],
                ]
            ))->json();

            $pageKey = Arr::get($data, 'result.pageKey');

            /** @var array<int, array{
             *  contractAddress: string,
             *  tokenBalance: string,
             * }> $tokenBalances
             **/
            $tokenBalances = Arr::get($data, 'result.tokenBalances', []);
            $tokenAddresses = collect($tokenBalances)->pluck('contractAddress');
            $tokens = Token::query()
                ->whereIn('address', $tokenAddresses->all())
                ->where('network_id', $network->id)
                ->get();

            // The API for owned tokens does not include metadata, so do another lookup in case we discover a completely
            // new token.
            $missingTokens = $tokenAddresses->diff($tokens->pluck('address'));
            $allTokens = $allTokens->concat($missingTokens->map(function ($token) {
                return $this->tokenMetadata($token);
            })->filter(function ($metadata) {
                return ! is_null($metadata);
            })->merge($tokens->map(function ($token) {
                return [
                    'address' => $token['address'],
                    'name' => $token['name'],
                    'symbol' => $token['symbol'],
                    'decimals' => $token['decimals'],
                ];
            })));

            $allTokenBalances = $allTokenBalances->concat($tokenBalances);
        } while ($pageKey !== null);

        $tokenBalancesByAddress = collect($allTokenBalances)->keyBy('contractAddress');

        return collect($allTokens)->map(function ($token) use ($wallet, $tokenBalancesByAddress, $network) {
            return new Web3Erc20TokenData(
                $token['address'],
                $network->id,
                $wallet->address,
                $token['name'],
                $token['symbol'],
                $token['decimals'],
                $token['logo'] ?? null,
                $token['thumbnail'] ?? null,
                // API returns hex strings; so convert it to a decimal string
                CryptoUtils::hexToBigIntStr($tokenBalancesByAddress[$token['address']]['tokenBalance']),
            );
        });
    }

    /**
     * @see https://docs.alchemy.com/reference/getnfts
     */
    public function getWalletNfts(Wallet $wallet, Network $network, string $cursor = null, int $limit = null): Web3NftsChunk
    {
        $this->apiUrl = $this->getNftV2ApiUrl();

        $this->chain = AlchemyChain::fromChainId($network->chain_id);

        $query = http_build_query([
            'owner' => $wallet->address,
            'pageKey' => $cursor,
            'withMetadata' => 'true',
            'pageSize' => is_null($limit) ? 100 : $limit,
        ]);

        // Alchemy doesn't like that PHP escapes arrays with indexes.
        // Inspired by: https://www.php.net/manual/en/function.http-build-query.php#111819
        $query = $query.'&'.preg_replace('/[[0-9]+]/', '[]', urldecode(http_build_query([
            'excludeFilters' => ['SPAM'],
        ])));

        $data = self::get('getNFTs', $query)->json();

        /** @var array<int, mixed> $ownedNfts */
        $ownedNfts = Arr::get($data, 'ownedNfts', []);

        $nfts = collect($ownedNfts)
            ->filter(fn ($nft) => $this->filterNft($nft, false))
            ->map(fn ($nft) => $this->parseNft($nft, $network->id))
            ->values();

        return new Web3NftsChunk(
            nfts: $nfts,
            nextToken: Arr::get($data, 'pageKey'),
        );
    }

    /**
     * @see https://docs.alchemy.com/reference/getnftmetadatabatch
     *
     * @param  Collection<int, Nft>  $nfts
     */
    public function nftMetadataBatch(Collection $nfts, Network $network): Web3NftsChunk
    {
        $this->apiUrl = $this->getNftV2ApiUrl();

        // All the requests need to have chain id defined.
        $this->chain = AlchemyChain::fromChainId($network->chain_id);

        $tokens = $nfts->map(function ($nft) {
            return [
                'contractAddress' => $nft->collection->address,
                'tokenId' => $nft->token_number,
            ];
        });

        $response = self::post('getNFTMetadataBatch', [
            'tokens' => $tokens,
        ])->json();

        /** @var Collection<int, Nft>  $response */
        $nftItems = collect($response)
            ->filter(fn ($nft) => $this->filterNft($nft))
            ->map(function ($nft) use ($network) {
                // With getNFTMetadataBatch, alchemy returns tokens numbers (`tokenId` field) as number instead of hex,
                // thus the `convertTokenNumber flag to save it as is withouth attempting to convert from hex.
                // See https://docs.alchemy.com/reference/sdk-getnftmetadatabatch#response-1
                return $this->parseNft($nft, $network->id, convertTokenNumber: false);
            })
            ->values();

        return new Web3NftsChunk(nfts: $nftItems, nextToken: null);
    }

    /**
     * @see https://docs.alchemy.com/reference/getnftsforcollection
     */
    public function collectionNfts(
        CollectionModel $collection,
        string $startToken = null,
        int $limit = null
    ): Web3NftsChunk {
        $this->apiUrl = $this->getNftV2ApiUrl();

        $this->chain = AlchemyChain::fromChainId($collection->network->chain_id);

        if ($limit == null) {
            $limit = 100;
        }

        $query = http_build_query([
            'contractAddress' => $collection->address,
            'withMetadata' => 'true',
            'startToken' => $startToken,
            'limit' => $limit,
        ]);

        $data = self::get('getNFTsForCollection', $query)->json();

        /**
         * @var array<int, mixed> $nfts
         */
        $nfts = Arr::get($data, 'nfts', []);

        $nextToken = Arr::get($data, 'nextToken');

        $nfts = collect($nfts)
            ->filter(fn ($nft) => $this->filterNft($nft))
            ->map(fn ($nft) => $this->parseNft($nft, $collection->network_id))
            ->values();

        return new Web3NftsChunk(
            nfts: $nfts,
            nextToken: $nextToken,
        );
    }

    /**
     * @return array<stdClass>|null
     */
    public function collectionNftsRaw(CollectionModel $collection, string $startToken = null): ?array
    {
        $this->apiUrl = $this->getNftV2ApiUrl();

        $this->chain = AlchemyChain::fromChainId($collection->network->chain_id);

        $query = http_build_query([
            'contractAddress' => $collection->address,
            'withMetadata' => 'true',
            'startToken' => $startToken,
        ]);

        return self::get('getNFTsForCollection', $query)->json();
    }

    public function getNativeBalance(Wallet $wallet, Network $network): string
    {
        $this->chain = AlchemyChain::fromChainId($network->chain_id);

        $data = self::post('', $this->payload('eth_getBalance', [
            $wallet->address,
        ]))->json('result');

        return CryptoUtils::hexToBigIntStr($data);
    }

    /**
     * @param  array<string>  $contactAddresses
     * @return Collection<int, Web3ContractMetadata>
     */
    public function getContractMetadataBatch(array $contactAddresses, Network $network): Collection
    {
        $this->apiUrl = $this->getNftV2ApiUrl();

        $this->chain = AlchemyChain::fromChainId($network->chain_id);

        /** @var array<int, mixed> $collections */
        $collections = self::post('getContractMetadataBatch', ['contractAddresses' => $contactAddresses])->json();

        return collect($collections)->map(function ($collectionMeta) {
            $supply = Arr::get($collectionMeta, 'contractMetadata.totalSupply');
            $mintedBlock = Arr::get($collectionMeta, 'contractMetadata.deployedBlockNumber');

            return new Web3ContractMetadata(
                contractAddress: $collectionMeta['address'],
                collectionName: Arr::get($collectionMeta, 'contractMetadata.name'),
                totalSupply: $supply ? (int) $supply : null,
                mintedBlock: $mintedBlock ? (int) $mintedBlock : null,
                collectionSlug: Arr::get($collectionMeta, 'contractMetadata.openSea.collectionSlug'),
                imageUrl: Arr::get($collectionMeta, 'contractMetadata.openSea.imageUrl'),
                floorPrice: Arr::get($collectionMeta, 'contractMetadata.openSea.floorPrice'),
                bannerImageUrl: Arr::get($collectionMeta, 'contractMetadata.openSea.bannerImageUrl'),
                description: Arr::get($collectionMeta, 'contractMetadata.openSea.description'),
            );
        });
    }

    /**
     * @param  array<mixed>  $nft
     */
    public function parseNft(array $nft, int $networkId, bool $convertTokenNumber = true): Web3NftData
    {
        $extractedFloorPrice = $this->tryExtractFloorPrice($nft);
        $collectionName = $this->collectionName($nft);
        $description = $nft['description'] ?? null;
        $supply = Arr::get($nft, 'contractMetadata.totalSupply');
        if (is_numeric($supply)) {
            $supply = intval($supply);
        }

        if ($description === null) {
            $description = $nft['metadata']['description'] ?? null;
        }

        if (is_array($description)) {
            $description = Arr::get($nft, 'description.0');
        }

        $socials = [
            'twitter' => Arr::get($nft, 'contractMetadata.openSea.twitterUsername'),
            'discord' => Arr::get($nft, 'contractMetadata.openSea.discordUrl'),
        ];

        if ($socials['discord'] && preg_match('/https:\/\/discord.gg\/(\w+)/', $socials['discord'], $matches)) {
            $socials['discord'] = $matches[1];
        }

        $mintTimestamp = $this->getNftMintingDateProperty($nft);

        $bannerImageUrl = Arr::get($nft, 'contractMetadata.openSea.bannerImageUrl');
        if (! empty($bannerImageUrl)) {
            $bannerImageUrl = NftImageUrl::get($bannerImageUrl, ImageSize::Banner);
        } else {
            $bannerImageUrl = null;
        }

        $tokenNumber = $convertTokenNumber === true ? CryptoUtils::hexToBigIntStr($nft['id']['tokenId']) : $nft['id']['tokenId'];

        $error = Arr::get($nft, 'error');
        $nftInfo = null;
        $collectionAddress = Arr::get($nft, 'contract.address');

        if (! empty($error)) {
            Log::info('AlchemyPendingRequest: Filter NFT', [
                'error' => $error,
                'collection_name' => $collectionName,
                'collection_address' => $collectionAddress,
                'nft_id' => $tokenNumber,
            ]);

            // if metadata stuff is empty, is empty object or empty array
            if (empty($nft['metadata']) || empty($nft['metadata']['metadata'])) {
                $nftInfo = NftInfo::MetadataOutdated->value;
            }
        }

        return new Web3NftData(
            tokenAddress: $nft['contract']['address'],
            tokenNumber: $tokenNumber,
            networkId: $networkId,
            collectionName: $collectionName,
            collectionSymbol: Arr::get($nft, 'contractMetadata.symbol') ?? $collectionName,
            collectionImage: Arr::get($nft, 'contractMetadata.openSea.imageUrl') ?? Arr::get($nft, 'media.0.thumbnail') ?? Arr::get($nft, 'media.0.gateway'),
            collectionWebsite: Arr::get($nft, 'contractMetadata.openSea.externalUrl') ?? Arr::get($nft, 'metadata.external_url'),
            collectionDescription: Arr::get($nft, 'contractMetadata.openSea.description'),
            collectionBannerImageUrl: $bannerImageUrl,
            collectionBannerUpdatedAt: Arr::get($nft, 'contractMetadata.openSea.bannerImageUrl') ? Carbon::now() : null,
            collectionOpenSeaSlug: Arr::get($nft, 'contractMetadata.openSea.collectionSlug'),
            collectionSocials: $socials,
            collectionSupply: $supply,
            name: $this->getNftName($nft),
            description: $description,
            extraAttributes: $this->getNftExtraAttributes($nft),
            floorPrice: $extractedFloorPrice ?
                new Web3NftCollectionFloorPrice(
                    $extractedFloorPrice,
                    'eth', // always eth here
                    Carbon::now(),
                ) : null,
            traits: $this->extractTraits($nft),
            mintedBlock: $nft['contractMetadata']['deployedBlockNumber'],
            mintedAt: $mintTimestamp !== null ? Carbon::createFromTimestampMs($mintTimestamp) : null,
            hasError: ! empty($error),
            info: $nftInfo,
        );
    }

    /**
     * @see https://docs.alchemy.com/reference/alchemy-gettokenmetadata
     *
     * @return array{
     *  address: string,
     *  decimals: integer,
     *  logo: string,
     *  name: string,
     *  symbol: string,
     * } | null
     */
    private function tokenMetadata(string $tokenAddress): ?array
    {
        try {
            $data = self::post('', $this->payload('alchemy_getTokenMetadata', [$tokenAddress]))->json();
            /** @var array{
             *  decimals: integer,
             *  logo: string,
             *  name: string,
             *  symbol: string,
             * } $metadata
             **/
            $metadata = Arr::get($data, 'result');

            return array_merge($metadata, ['address' => $tokenAddress]);
        } catch (ClientException $e) {
            if ($e->getCode() === 404) {
                return null;
            }

            throw $e;
        }
    }

    // https://docs.alchemy.com/reference/getfloorprice
    public function getNftCollectionFloorPrice(Chain $chain, string $contractAddress): ?Web3NftCollectionFloorPrice
    {
        // Only ETH is supported at the moment since this API is still considered in beta:

        // Chain	Mainnet	Testnet
        // Ethereum    OK	   X
        // Polygon	   X       X
        // Optimism	   X       X
        // Arbitrum	   X       X
        if ($chain !== Chain::ETH) {
            return null;
        }

        $this->apiUrl = $this->getNftV3ApiUrl();
        $this->chain = AlchemyChain::fromChainId($chain->value);

        /** @var array<string, mixed> $data */
        $data = self::get('getFloorPrice', [
            'contractAddress' => $contractAddress,
        ])->json();

        // If there is no price information for a contract, the response looks like this:
        // {
        //   "openSea": {
        //     "error": "unable to fetch floor price"
        //   }
        // }
        //
        // A normal response looks like this:
        //
        // {
        //   "openSea": {
        //     "floorPrice": 1.235,
        //     "priceCurrency": "ETH",
        //     "retrievedAt": "2023-03-30T04:08:09.791Z",
        //     "collectionUrl": "https://opensea.io/collection/world-of-women-nft",
        //     "error": null
        //   },
        //   "looksRare": {
        //     "floorPrice": 1.2472,
        //     "priceCurrency": "ETH",
        //     "retrievedAt": "2023-03-30T03:59:09.707Z",
        //     "collectionUrl": "https://looksrare.org/collections/0xe785e82358879f061bc3dcac6f0444462d4b5330"
        //     "error": null
        //   }
        // }
        /** @var array<string, mixed> | null $priceInfo */
        $priceInfo = collect($data)->first(function ($k, $v) {
            return ! Arr::has($k, 'error');
        });

        if (empty($priceInfo)) {
            return null;
        }

        return new Web3NftCollectionFloorPrice(
            CryptoUtils::convertToWei($priceInfo['floorPrice'], CryptoCurrencyDecimals::forCurrency($priceInfo['priceCurrency'])),
            Str::lower($priceInfo['priceCurrency']),
            Carbon::parse($priceInfo['retrievedAt']),
        );
    }

    public function getBlockTimestamp(Network $network, int $blockNumber): Carbon
    {
        $this->chain = AlchemyChain::fromChainId($network->chain_id);

        $response = self::post('', $this->payload('eth_getBlockByNumber', [
            '0x'.dechex($blockNumber),
            false,
        ]))->json('result');

        $timestamp = CryptoUtils::hexToBigIntStr($response['timestamp']);

        return Carbon::createFromTimestamp($timestamp);
    }

    /**
     * @param  array<int, array<string, mixed>|string|boolean>  $params
     * @return array<string, mixed>
     */
    private function payload(string $method, array $params): array
    {
        return [
            'id' => 1,
            'jsonrpc' => '2.0',
            'method' => $method,
            'params' => $params,
        ];
    }

    /**
     * @param  array<string, mixed>  $nft
     * @return array{images: array{thumb: string | null, small: string | null, large: string | null, original: string | null, originalRaw: string | null}}
     */
    private function getNftExtraAttributes(array $nft): array
    {
        $imageUrl = $this->tryExtractImage($nft);

        $images = array_merge(
            NftImageUrl::getAllSizes($imageUrl),
            $this->tryExtractAssetUrls($nft)
        );

        return ['images' => $images];
    }

    /**
     * This method extracts original asset URLs from the NFT data.
     * originalRawUrl - Uri representing the location of the NFT's
     * original metadata blob.
     * originalUrl - Public gateway uri for the raw uri above.
     * For more @see https://docs.alchemy.com/reference/getnfts
     *
     * @param  array<string, mixed>  $nft
     * @return array{originalRaw: string | null, original: string | null}
     */
    private function tryExtractAssetUrls(array $nft): array
    {
        $originalRaw = Arr::get($nft, 'media.0.raw');
        $original = Arr::get($nft, 'media.0.gateway');

        return [
            'originalRaw' => empty($originalRaw) || isBase64EncodedImage($originalRaw) ? null : $originalRaw,
            'original' => empty($original) || isBase64EncodedImage($original) ? null : $original,
        ];
    }

    /**
     * @param  array<string, mixed>  $nft
     */
    private function tryExtractImage(array $nft): ?string
    {
        $imageKeys = [
            'media.0.thumbnail',
            'media.0.raw',
            'metadata.image',
            'contractMetadata.openSea.imageUrl',
        ];

        foreach ($imageKeys as $imageKey) {
            $imageUrl = Arr::get($nft, $imageKey);

            if (! empty($imageUrl) && ! isBase64EncodedImage($imageUrl)) {
                return $imageUrl;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $nft
     */
    private function getNftName(array $nft): ?string
    {
        // Intrinsic name has priority over any other name
        $name = Arr::get($nft, 'title');
        if (! empty($name)) {
            return $name;
        }

        // when the name is missing, marketplaces typically show "#tokenId" or similar.
        // Instead of forcing a specific name, we let the frontend decide.
        return null;
    }

    /**
     * @param  array<string, mixed>  $nft
     */
    private function tryExtractFloorPrice(array $nft): ?string
    {
        $floorPrice = Arr::get($nft, 'contractMetadata.openSea.floorPrice');
        if (empty($floorPrice)) {
            return null;
        }

        // Alchemy returns floor price in ETH (e.g. 0.003) but we store it internally in WEI to be consistent
        return CryptoUtils::convertToWei($floorPrice, CryptoCurrencyDecimals::ETH->value);
    }

    /**
     * @param  array<string, mixed>  $nft
     */
    private function getNftMintingDateProperty(array $nft): ?string
    {
        /** @var array<array{trait_type: string | null, value: string | null, display_type: string | null}> $props */
        $props = Arr::get($nft, 'metadata.attributes', Arr::get($nft, 'metadata.properties', []));

        return collect($props)->first(
            fn ($item) => ($item['trait_type'] ?? null) === 'date'
        )['value'] ?? null;
    }

    /**
     * @param  array<string, mixed>  $nft
     * @return array<array{name: string, value: string, displayType: TraitDisplayType}>
     */
    private function extractTraits(array $nft): array
    {
        /** @var array<array{trait_type: string | null, value: string | null, display_type: string | null}> $props */
        $props = Arr::get($nft, 'metadata.attributes', Arr::get($nft, 'metadata.properties', []));

        return collect($props)
            ->filter(function ($item) {
                return ! empty(Arr::get($item, 'trait_type')) && ! empty(Arr::get($item, 'value')) && ! is_array(Arr::get($item, 'value'));
            })
            ->map(function ($item) {
                $value = strval($item['value']);
                $displayType = TraitDisplayType::fromAlchemyDisplayType(Arr::get($item, 'display_type'), $value);

                return [
                    'name' => $item['trait_type'],
                    'value' => $value,
                    'displayType' => $displayType,
                ];
            })
            ->toArray();
    }

    private function getNftV2ApiUrl(): string
    {
        return 'https://'.self::$apiUrlPlaceholder.'.g.alchemy.com/nft/v2/';
    }

    private function getNftV3ApiUrl(): string
    {
        return 'https://'.self::$apiUrlPlaceholder.'.g.alchemy.com/nft/v3/';
    }

    private function filterNft(mixed $nft, bool $filterError = true): bool
    {
        if (Arr::get($nft, 'spamInfo.isSpam', false)) {
            return false;
        }

        if (Arr::has($nft, 'error') && $filterError) {
            return false;
        }

        if (! TokenType::compare(TokenType::Erc721, Arr::get($nft, 'id.tokenMetadata.tokenType', ''))) {
            return false;
        }

        // Only one has to exist, the missing one gets substituted
        $hasCollectionName = ! empty($this->collectionName($nft));
        $hasCollectionSymbol = ! empty(Arr::get($nft, 'contractMetadata.symbol'));

        if (! $hasCollectionName && ! $hasCollectionSymbol) {
            return false;
        }

        return true;
    }

    private function collectionName(mixed $nft): ?string
    {
        return Arr::get($nft, 'contractMetadata.name') ?? Arr::get($nft, 'contractMetadata.openSea.collectionName');
    }

    /**
     * @return array<string>
     */
    public function getSpamContracts(Network $network): array
    {
        $this->apiUrl = $this->getNftV3ApiUrl();

        $this->chain = AlchemyChain::fromChainId($network->chain_id);

        return self::get('getSpamContracts')->json('contractAddresses');
    }
}
