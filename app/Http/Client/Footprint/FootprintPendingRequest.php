<?php

declare(strict_types=1);

namespace App\Http\Client\Footprint;

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Enums\Chains;
use App\Enums\CryptoCurrencyDecimals;
use App\Enums\FootprintChain;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Support\CryptoUtils;
use Carbon\Carbon;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Http\Client\ConnectionException as LaravelConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Throwable;

class FootprintPendingRequest extends PendingRequest
{
    protected string $apiUrl;

    private ?FootprintChain $chain = null;

    /**
     * Create a new HTTP Client instance.
     *
     * @return void
     */
    public function __construct(Factory $factory = null)
    {
        parent::__construct($factory);

        $this->apiUrl = config('services.footprint.endpoint');

        $this->options = [
            'headers' => [
                'accept' => 'application/json',
                'api-key' => config('services.footprint.key'),
            ],
        ];
    }

    /**
     * Issue a GET request to the given URL.
     *
     * @param  array<mixed>  $query
     * @return Response
     */
    public function get(string $url, $query = null)
    {
        $url = sprintf('%s%s', $this->apiUrl, $url);

        $query = Arr::prepend($query, $this->chain->value, 'chain');

        try {
            return parent::get($url, $query);
        } catch (Throwable $throwable) {
            if ($throwable instanceof LaravelConnectionException || $throwable instanceof ServerException) {
                throw new ConnectionException('Footprint', $url, $throwable->getCode());
            }

            if ($throwable instanceof ClientException && $throwable->getCode() === 429) {
                $retryAfter = $throwable->getResponse()->getHeader('Retry-After')[0] ?? 30;

                throw new RateLimitException((int) $retryAfter);
            }

            throw $throwable;
        }
    }

    /**
     * @see https://docs.footprint.network/reference/get_v2-nft-collection-metrics
     */
    public function getNftCollectionFloorPrice(Chains $chain, string $contractAddress): ?Web3NftCollectionFloorPrice
    {
        $this->chain = FootprintChain::fromChainId($chain->value);

        $data = self::get('nft/collection/metrics', [
            'collection_contract_address' => $contractAddress,
        ]);

        if ($data->json('message') !== 'success') {
            return null;
        }

        /**
         * @var array{
         *  floor_price_amount: float,
         *  amount_currency: string,
         *  on_date: string
         * } $collectionMetaData
         */
        $collectionMetaData = $data->json('data.0');

        $currency = $collectionMetaData['amount_currency'];

        return new Web3NftCollectionFloorPrice(
            price: CryptoUtils::convertToWei($collectionMetaData['floor_price_amount'], CryptoCurrencyDecimals::forCurrency($currency)),
            currency: Str::lower($currency),
            // Note: its not really clear if this date represents the retrieved
            // date, the documentation doesnt mention it.
            // Also there is a `latest_time` attribute on the response, but
            // on my test it returns the same date
            retrievedAt: Carbon::parse($collectionMetaData['on_date']),
        );
    }
}
