<?php

declare(strict_types=1);

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Support\Facades\Opensea;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Http;

it('should throw a custom exception on internal server error', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v1/collection*' => Http::response(null, 500),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getNftCollectionFloorPrice($collectionSlug);
})->throws(ConnectionException::class);

it('should throw a custom exception when rate limited', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v1/collection*' => Http::response(null, 429),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getNftCollectionFloorPrice($collectionSlug);
})->throws(RateLimitException::class);

it('should throw a custom exception on client error', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v1/collection*' => Http::response(null, 400),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getNftCollectionFloorPrice($collectionSlug);
})->throws(ClientException::class);

it('can get floor price for the collection', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v1/collection*' => Opensea::response(fixtureData('opensea.collection_stats')),
    ]);

    $collectionSlug = 'doodles-official';

    $data = Opensea::getNftCollectionFloorPrice($collectionSlug);

    expect($data)->toBeInstanceOf(Web3NftCollectionFloorPrice::class);
});
