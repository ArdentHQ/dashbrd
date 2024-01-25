<?php

declare(strict_types=1);

namespace App\Http\Client\Mnemonic;

use App\Data\Web3\CollectionActivity;
use App\Data\Web3\Web3CollectionFloorPrice;
use App\Data\Web3\Web3CollectionTrait;
use App\Data\Web3\Web3Volume;
use App\Enums\Chain;
use App\Enums\CryptoCurrencyDecimals;
use App\Enums\CurrencyCode;
use App\Enums\ImageSize;
use App\Enums\MnemonicChain;
use App\Enums\NftTransferType;
use App\Enums\TraitDisplayType;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Token;
use App\Models\TokenPriceHistory;
use App\Support\CryptoUtils;
use App\Support\NftImageUrl;
use App\Support\Web3NftHandler;
use Carbon\Carbon;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Http\Client\ConnectionException as LaravelConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Throwable;

class MnemonicPendingRequest extends PendingRequest
{
    protected string $apiUrl;

    private static string $apiUrlPlaceholder = '{CHAIN-NETWORK}';

    private ?MnemonicChain $chain = null;

    /**
     * Create a new HTTP Client instance.
     *
     * @return void
     */
    public function __construct(?Factory $factory = null)
    {
        parent::__construct($factory);

        // The placeholder is dynamically replaced at runtime when the chain is known.
        // example url: https://polygon-rest.mnemonichq.com/
        $this->apiUrl = 'https://'.self::$apiUrlPlaceholder.'-rest.api.mnemonichq.com';

        $this->options = [
            'headers' => [
                'Accepts' => 'application/json',
                'X-API-Key' => config('services.mnemonic.key'),
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
            throw new MnemonicUnknownChainException();
        }

        // Replace network placeholder
        /** @var string */
        $url = Str::replace(self::$apiUrlPlaceholder, $this->chain->value, $this->apiUrl);

        $url = $url.$path;

        try {
            return parent::send($method, $url, $options);
        } catch (Throwable $e) {
            if ($e instanceof LaravelConnectionException || $e instanceof ServerException) {
                throw new ConnectionException('Mnemonic', $url, $e->getCode());
            }

            if ($e instanceof ClientException && $e->getCode() === 429) {
                $retryAfter = $e->getResponse()->getHeader('Retry-After')[0] ?? 30;

                throw new RateLimitException((int) $retryAfter);
            }

            throw $e;
        }
    }

    // https://docs.mnemonichq.com/reference/marketplacesservice_getfloorprice
    public function getCollectionFloorPrice(Chain $chain, string $contractAddress): ?Web3CollectionFloorPrice
    {
        $this->chain = MnemonicChain::fromChain($chain);

        try {

            /** @var array<string, mixed> $data */
            $data = self::get(sprintf('/marketplaces/v1beta2/floors/%s', $contractAddress), [])
                ->json();

            // Always returns 200, even if collection doesn't exist.
            // In this case the response looks like this:
            // {
            //   "price": {
            //     "totalNative": null,
            //     "totalUsd": null,
            //     "fungibleAddress": "",
            //     "fungibleValue": null
            //   }
            // }

            // A normal response looks like this:
            //
            // {
            //   "price": {
            //     "totalNative": "0.0102677925818819934",
            //     "totalUsd": "0.0112322052834260868",
            //     "fungibleAddress": "0xaddress",
            //     "fungibleValue": "0.000006"
            //   }
            // }
            $value = Arr::get($data, 'price.totalNative');
            if ($value === null) {
                return null;
            }

            // The API response always includes the native and usd amounts.
            // Optional is the fungible amount in case it's not a native token.
            // In the above example response, the fungible token is WETH.
            //
            // Meaning, that if we get a fungible address
            // - Look up the currency in our db
            // - If we don't know about the currency (very unlikely), we fall back to the native token
            //  since in this case we always now how the currency is called.

            $currency = $chain->nativeCurrency();
            $decimals = CryptoCurrencyDecimals::forCurrency($currency);

            $fungibleAddress = Arr::get($data, 'price.fungibleAddress');
            if (! empty($fungibleAddress)) {
                $token = Token::mainnet()->where('address', $fungibleAddress)->first();

                if ($token !== null) {
                    $value = Arr::get($data, 'price.fungibleValue');
                    $decimals = $token['decimals'];
                    $currency = $token['symbol'];
                }
            }

            return new Web3CollectionFloorPrice(
                CryptoUtils::convertToWei($value, $decimals),
                Str::lower($currency),
                Carbon::now(),
            );
        } catch (ClientException $e) {
            //
            // Unsupported contracts may fail with:
            // `400 Bad Request`: "floor price is not supported for contract address"
            //
            // This happens for example with ENS domains
            //
            // We want to handle this gracefully by returning null.
            if ($e->getCode() == 400) {
                return null;
            }

            throw $e;
        }
    }

    /**
     * Fetch the banner image for the collection.
     *
     * @see https://docs.mnemonichq.com/reference/foundationalservice_getnftcontracts
     */
    public function getCollectionBanner(Chain $chain, string $contractAddress): ?string
    {
        $this->chain = MnemonicChain::fromChain($chain);

        $url = $this->get('/foundational/v1beta2/nft_contracts', [
            'contractAddresses' => $contractAddress,
        ])->json('nftContracts.0.bannerImageUrl');

        if ($url === null || $url === '') {
            return null;
        }

        // The URL includes a w= parameter. We want to normalize it, so that we can store a higher resolution image...
        return NftImageUrl::get($url, ImageSize::Banner);
    }

    /**
     * Retrieve the number of owners of the collection.
     *
     * @see https://docs.mnemonichq.com/reference/collectionsservice_gettotals
     */
    public function getCollectionOwners(Chain $chain, string $contractAddress): int
    {
        $this->chain = MnemonicChain::fromChain($chain);

        return (int) $this->get(
            '/collections/v1beta2/'.$contractAddress.'/totals'
        )->json('ownersCount');
    }

    /**
     * Retrieve the 30-day volume history for the collection address.
     *
     * @see https://docs.mnemonichq.com/reference/collectionsservice_getsalesvolume
     *
     * @return Collection<int, Web3Volume>
     */
    public function getCollectionVolumeHistory(Chain $chain, string $address): Collection
    {
        $this->chain = MnemonicChain::fromChain($chain);

        /** @var array{timestamp: string, volume: string}[] */
        $response = $this->get(
            '/collections/v1beta2/'.$address.'/sales_volume/DURATION_30_DAYS/GROUP_BY_PERIOD_1_DAY'
        )->json('dataPoints');

        return collect($response)->map(fn ($dataPoint) => new Web3Volume(
            value: CryptoUtils::convertToWei($dataPoint['volume'], $chain->nativeCurrencyDecimals()),
            date: Carbon::parse($dataPoint['timestamp']),
        ));
    }

    /**
     * Retrieve the latest sales volume amount for the collection address.
     *
     * @see https://docs.mnemonichq.com/reference/collectionsservice_getsalesvolume
     */
    public function getLatestCollectionVolume(Chain $chain, string $contractAddress): Web3Volume
    {
        $this->chain = MnemonicChain::fromChain($chain);

        $response = $this->get(
            '/collections/v1beta2/'.$contractAddress.'/sales_volume/DURATION_1_DAY/GROUP_BY_PERIOD_1_DAY'
        )->json('dataPoints.0');

        if (empty($response)) {
            return new Web3Volume(
                value: '0',
                date: today(),
            );
        }

        return new Web3Volume(
            value: CryptoUtils::convertToWei($response['volume'] ?? '0', $chain->nativeCurrencyDecimals()),
            date: Carbon::parse($response['timestamp'] ?? today()),
        );
    }

    // https://docs.mnemonichq.com/reference/collectionsservice_getnumerictraits
    // https://docs.mnemonichq.com/reference/collectionsservice_getstringtraits
    /**
     * @return Collection<int, Web3CollectionTrait>
     */
    public function getCollectionTraits(Chain $chain, string $contractAddress): Collection
    {
        //  {
        //      "name": "string",
        //      "value": "blindeded",
        //      "nftsCount": "283",
        //      "nftsPercentage": 2.8302830283028304
        //  }
        $stringTraits = $this->fetchCollectionTraits($chain, $contractAddress, 'string', static fn (array $trait) => new Web3CollectionTrait(
            name: $trait['name'],
            value: $trait['value'],
            valueMin: null,
            valueMax: null,
            nftsCount: $trait['nftsCount'],
            nftsPercentage: $trait['nftsPercentage'],
            displayType: TraitDisplayType::fromMnemonicDisplayType($trait['displayType'] ?? null, $trait['value']),
        ));

        //  {
        //      "name": "string",
        //      "displayType": "DISPLAY_TYPE_STAT",
        //      "valueMin": 0,
        //      "valueMax": 0
        //  }
        $numericTraits = $this->fetchCollectionTraits($chain, $contractAddress, 'numeric', static fn (array $trait) => new Web3CollectionTrait(
            name: $trait['name'],
            value: Web3NftHandler::$numericTraitPlaceholder,
            valueMin: $trait['valueMin'],
            valueMax: $trait['valueMax'],
            nftsCount: $trait['nftsCount'] ?? '0',
            nftsPercentage: $trait['nftsPercentage'] ?? 0,
            displayType: TraitDisplayType::fromMnemonicDisplayType($trait['displayType'] ?? null, null),
        ));

        return $stringTraits->merge($numericTraits)->unique(static fn ($trait) => $trait->name.'_'.$trait->value);
    }

    /**
     * @return Collection<int, Web3CollectionTrait>
     */
    private function fetchCollectionTraits(Chain $chain, string $contractAddress, string $kind, callable $mapper): Collection
    {
        $this->chain = MnemonicChain::fromChain($chain);

        // https://ethereum-rest.api.mnemonichq.com/collections/v1beta2/:contractAddress/traits/numeric?limit=string&offset=string

        $limit = 500;
        $offset = 0;
        $result = collect();

        do {
            /** @var array<string, mixed> $data */
            $data = self::get(sprintf('/collections/v1beta2/%s/traits/%s', $contractAddress, $kind), [
                'limit' => $limit,
                'offset' => $offset,
            ])->json('traits');

            $result = $result->merge(
                collect($data)->map(function ($trait) use ($mapper) {
                    /** @var Web3CollectionTrait $result */
                    $result = $mapper($trait);

                    // This ensures we deduplicate dates/numerics properly, so we do not end up with thousands of unique traits
                    // per different number.
                    if ($result->displayType->isNumeric()) {
                        $result->value = Web3NftHandler::$numericTraitPlaceholder;
                    }

                    return $result;
                }
                )
            );

            $offset += count($data);

            // circuit break to not cause infinite loop in case of bug
            if ($offset / $limit >= 10) {
                break;
            }

        } while ($limit <= count($data));

        return $result;
    }

    /**
     * @see https://docs.mnemonichq.com/reference/foundationalservice_getnfttransfers
     *
     * @return Collection<int, CollectionActivity>
     */
    public function getCollectionActivity(Chain $chain, string $contractAddress, int $limit, ?Carbon $from = null): Collection
    {
        $this->chain = MnemonicChain::fromChain($chain);

        // Grab the ETH token regardless of the chain, because always want to report prices in ETH...
        $ethToken = Token::query()
                    ->whereHas('network', fn ($query) => $query->where('chain_id', Chain::ETH->value))
                    ->where('is_native_token', true)
                    ->firstOrFail();

        $query = [
            'limit' => $limit,
            // Oldest first
            'sortDirection' => 'SORT_DIRECTION_ASC',
            'contractAddress' => $contractAddress,
        ];

        // I cant pass the `labelsAny` filter directly to the query array because
        // it uses the same key multiple times, so I have to pass it as a query
        // string
        $labelsQuery = implode('&', array_map(fn ($label) => 'labelsAny='.$label, [
            'LABEL_MINT',
            'LABEL_SALE',
            'LABEL_TRANSFER',
            'LABEL_BURN',
        ]));

        if ($from !== null) {
            $query['blockTimestampGt'] = $from->toISOString();
        }

        /** @var array<string, mixed> $data */
        $data = self::get(sprintf('/foundational/v1beta2/transfers/nft?%s', $labelsQuery), $query)->json('nftTransfers');

        return collect($data)->map(function ($transfer) use ($chain, $contractAddress, $ethToken) {
            $currency = CurrencyCode::USD;

            $blockchainTimestamp = Carbon::parse($transfer['blockchainEvent']['blockTimestamp']);
            $prices = $this->extractActivityPrices($chain, $transfer, $currency, $ethToken, $blockchainTimestamp);

            return new CollectionActivity(
                contractAddress: $contractAddress,
                tokenId: $transfer['tokenId'],
                sender: $transfer['sender']['address'],
                recipient: $transfer['recipient']['address'],
                txHash: $transfer['blockchainEvent']['txHash'],
                logIndex: $transfer['blockchainEvent']['logIndex'],
                type: $this->extractNftTransferType($transfer['labels']),
                timestamp: $blockchainTimestamp,
                totalNative: $prices['native'],
                totalUsd: $prices['usd'],
                extraAttributes: [
                    'recipient' => Arr::get($transfer, 'recipient'),
                    'recipientPaid' => Arr::get($transfer, 'recipientPaid'),
                    'sender' => Arr::get($transfer, 'sender'),
                    'senderReceived' => Arr::get($transfer, 'senderReceived'),
                ]
            );
        })->values();
    }

    /**
     * @see https://docs.mnemonichq.com/reference/foundationalservice_getnfttransfers
     *
     * @return Collection<int, CollectionActivity>
     */
    public function getBurnActivity(Chain $chain, string $contractAddress, int $limit, ?Carbon $from = null): Collection
    {
        // Very similar to `getCollectionActivity` method, however this method only cares about `LABEL_BURN` labels...

        $this->chain = MnemonicChain::fromChain($chain);

        // Grab the ETH token regardless of the chain, because always want to report prices in ETH...
        $ethToken = Token::query()
                    ->whereHas('network', fn ($query) => $query->where('chain_id', Chain::ETH->value))
                    ->where('is_native_token', true)
                    ->firstOrFail();

        $query = [
            'limit' => $limit,
            // Oldest first
            'sortDirection' => 'SORT_DIRECTION_ASC',
            'contractAddress' => $contractAddress,
            'labelsAny' => 'LABEL_BURN',
        ];

        if ($from !== null) {
            $query['blockTimestampGt'] = $from->toISOString();
        }

        /** @var array<string, mixed> $data */
        $data = self::get('/foundational/v1beta2/transfers/nft', $query)->json('nftTransfers');

        return collect($data)->map(function ($transfer) use ($chain, $contractAddress, $ethToken) {
            $currency = CurrencyCode::USD;

            $blockchainTimestamp = Carbon::parse($transfer['blockchainEvent']['blockTimestamp']);
            $prices = $this->extractActivityPrices($chain, $transfer, $currency, $ethToken, $blockchainTimestamp);

            return new CollectionActivity(
                contractAddress: $contractAddress,
                tokenId: $transfer['tokenId'],
                sender: $transfer['sender']['address'],
                recipient: $transfer['recipient']['address'],
                txHash: $transfer['blockchainEvent']['txHash'],
                logIndex: $transfer['blockchainEvent']['logIndex'],
                type: $this->extractNftTransferType($transfer['labels']),
                timestamp: $blockchainTimestamp,
                totalNative: $prices['native'],
                totalUsd: $prices['usd'],
                extraAttributes: [
                    'recipient' => Arr::get($transfer, 'recipient'),
                    'recipientPaid' => Arr::get($transfer, 'recipientPaid'),
                    'sender' => Arr::get($transfer, 'sender'),
                    'senderReceived' => Arr::get($transfer, 'senderReceived'),
                ]
            );
        })->values();
    }

    /**
     * @param  array<string, mixed>  $transfer
     * @return array{ usd: float | null, native: float | null }
     */
    private function extractActivityPrices(Chain $chain, array $transfer, CurrencyCode $currency, Token $ethToken, Carbon $blockchainTimestamp): array
    {
        // Relevant: https://docs.mnemonichq.com/docs/price-attribution#getting-nft-prices

        $usdPriceString = Arr::get($transfer, 'recipientPaid.totalUsd');
        $usdPrice = $usdPriceString ? (float) $usdPriceString : null;

        $nativeTotalString = Arr::get($transfer, 'recipientPaid.totalNative');
        $nativePrice = $nativeTotalString ? (float) $nativeTotalString : null;

        if ($chain !== Chain::ETH && $usdPrice !== null) {
            // On non-ETH chains we get native in e.g. MATIC so normalize it to ETH using our historical price data.
            $nativePrice = $this->getActivityNativePrice($ethToken, $currency, $blockchainTimestamp, $usdPrice);
        }

        return [
            'usd' => $usdPrice,
            'native' => $nativePrice,
        ];
    }

    /**
     * Finds a historical price record and converts USD amount to native
     */
    private function getActivityNativePrice(
        Token $token,
        CurrencyCode $code,
        Carbon $timestamp,
        float $usdPrice
    ): ?float {
        /** @var TokenPriceHistory|null $historicalPrice */
        $historicalPrice = TokenPriceHistory::getHistory($token, $code, $timestamp);

        // no historical price record found
        if ($historicalPrice === null || $historicalPrice->price == 0) {
            return null;
        }

        return $usdPrice / $historicalPrice->price;
    }

    /**
     * @param  string[]  $labels
     *
     * @see https://docs.mnemonichq.com/references/uniform/rest/reference/#operation/FoundationalService_GetNftTransfers
     */
    private function extractNftTransferType(array $labels): ?NftTransferType
    {
        $label = collect($labels)->intersect([
            'LABEL_MINT', 'LABEL_BURN', 'LABEL_TRANSFER', 'LABEL_SALE',
        ])->first();

        return match ($label) {
            'LABEL_MINT' => NftTransferType::Mint,
            'LABEL_SALE' => NftTransferType::Sale,
            'LABEL_TRANSFER' => NftTransferType::Transfer,
            'LABEL_BURN' => NftTransferType::Burn,
            default => null,
        };
    }
}
