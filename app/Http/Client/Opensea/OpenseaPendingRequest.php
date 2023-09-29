<?php

declare(strict_types=1);

namespace App\Http\Client\Opensea;

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Enums\CryptoCurrencyDecimals;
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
use Illuminate\Support\Str;
use Throwable;

class OpenseaPendingRequest extends PendingRequest
{
    protected string $apiUrl;

    /**
     * Create a new HTTP Client instance.
     *
     * @return void
     */
    public function __construct(Factory $factory = null)
    {
        parent::__construct($factory);

        $this->apiUrl = config('services.opensea.endpoint');

        $this->options = [
            'headers' => [
                'accept' => 'application/json',
                'X-API-KEY' => config('services.opensea.key'),
            ],
        ];
    }

    /**
     * Issue a GET request to the given URL.
     *
     * @param  array<mixed>  $query
     * @return Response
     */
    public function get(string $url, $query = null, int $apiVersion = 1)
    {
        $url = sprintf('%sv%d/%s', $this->apiUrl, $apiVersion, $url);

        try {
            return parent::get($url, $query);
        } catch (Throwable $throwable) {
            if ($throwable instanceof LaravelConnectionException || $throwable instanceof ServerException) {
                throw new ConnectionException('opensea', $url, $throwable->getCode());
            }

            dd($throwable->getResponse());

            if ($throwable instanceof ClientException && $throwable->getCode() === 429) {
                $retryAfter = $throwable->getResponse()->getHeader('Retry-After')[0] ?? 30;

                throw new RateLimitException((int) $retryAfter);
            }

            throw $throwable;
        }
    }

    /**
     * @see https://docs.opensea.io/v1.0/reference/retrieving-collection-stats
     */
    public function getNftCollectionFloorPrice(string $collectionSlug): ?Web3NftCollectionFloorPrice
    {
        $data = self::get(sprintf('collection/%s/stats', $collectionSlug));

        dd($data->json());

        if ($data->json('message') !== 'success') {
            return null;
        }

        /**
         * @var array{
         *  floor_price_amount: float,
         *  amount_currency: string,
         *  on_date: string
         * }|null $collectionMetaData
         */
        $collectionMetaData = $data->json('data.0');

        // It's possible to have a 200 response with an empty data array
        if ($collectionMetaData === null) {
            return null;
        }

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
