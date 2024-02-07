<?php

declare(strict_types=1);

namespace App\Http\Client\Opensea;

use App\Data\Web3\Web3CollectionFloorPrice;
use App\Enums\Chain;
use App\Enums\CryptoCurrencyDecimals;
use App\Enums\OpenseaChain;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Http\Client\Opensea\Data\OpenseaNftDetails;
use App\Models\Collection;
use App\Support\CryptoUtils;
use Carbon\Carbon;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Http\Client\ConnectionException as LaravelConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Throwable;

class OpenseaPendingRequest extends PendingRequest
{
    protected string $apiUrl;

    /**
     * Create a new HTTP Client instance.
     *
     * @return void
     */
    public function __construct(?Factory $factory = null)
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

            if ($throwable instanceof ClientException && $throwable->getCode() === 429) {
                $retryAfter = $throwable->getResponse()->getHeader('Retry-After')[0] ?? 30;

                throw new RateLimitException((int) $retryAfter);
            }

            throw $throwable;
        }
    }

    public function nft(Chain $chain, string $address, string $identifier): ?OpenseaNftDetails
    {
        try {
            $chain = OpenseaChain::fromChainId($chain->value)->value;

            $response = self::get(
                url: sprintf('chain/%s/contract/%s/nfts/%s', $chain, $address, $identifier),
                apiVersion: 2
            );

            return new OpenseaNftDetails($response->json('nft'));
        } catch (ClientException $exception) {
            if ($exception->getCode() === 400) {
                return null;
            }

            throw $exception;
        }
    }

    /**
     * @see https://docs.opensea.io/reference/get_collection_stats
     */
    public function getCollectionFloorPrice(string $collectionSlug): ?Web3CollectionFloorPrice
    {
        try {
            $response = $this->makeCollectionStatsRequest($collectionSlug);

            $floorPrice = $response->json('total.floor_price');

            $currency = 'eth'; // OpenSea reports everything in ETH

            // In case of no floor price we return and don't update the value
            if ($floorPrice === null) {
                return null;
            }

            return new Web3CollectionFloorPrice(
                price: CryptoUtils::convertToWei($floorPrice, CryptoCurrencyDecimals::forCurrency($currency)),
                currency: $currency,
                // For the rest of the providers we get the timestamp from the response
                // but for Opensea we dont have any value we can use so im using the
                // current time.
                retrievedAt: Carbon::now(),
            );
        } catch (ClientException $exception) {
            if ($exception->getCode() === 404) {
                return null;
            }

            throw $exception;
        }
    }

    /**
     * @see https://docs.opensea.io/reference/get_collection_stats
     */
    public function getCollectionTotalVolume(Collection $collection): ?string
    {
        $response = $this->makeCollectionStatsRequest($collection->openSeaSlug());

        $volume = $response->json('total.volume');

        return $volume === null
                    ? null
                    : CryptoUtils::convertToWei($volume, CryptoCurrencyDecimals::ETH->value);
    }

    private function makeCollectionStatsRequest(string $collectionSlug): Response
    {
        // We cache for an hour because floor price job runs every hour...
        // But we cache it just so that we can reuse the response for total volume without needing to hit an API endpoint again...
        $ttl = now()->addMinutes(59);

        return Cache::remember('opensea:collections-stats:'.$collectionSlug, $ttl, function () use ($collectionSlug) {
            return self::get(sprintf('collections/%s/stats', $collectionSlug), apiVersion: 2);
        });
    }
}
