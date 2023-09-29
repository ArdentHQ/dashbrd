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
        'https:///api.opensea.io/api/v1/*' => Http::response(null, 500),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getNftCollectionFloorPrice($collectionSlug);
})->throws(ConnectionException::class);

it('should throw a custom exception when rate limited', function () {
    Opensea::fake([
        'https:///api.opensea.io/api/v1/*' => Http::response(null, 429),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getNftCollectionFloorPrice($collectionSlug);
})->throws(RateLimitException::class);

it('should throw a custom exception on client error', function () {
    Opensea::fake([
        'https:///api.opensea.io/api/v1/*' => Http::response(null, 400),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getNftCollectionFloorPrice($collectionSlug);
})->throws(ClientException::class);

it('should not get floor price if unable to process request', function () {
    Opensea::fake([
        'https:///api.opensea.io/api/v1/*' => Opensea::response(fixtureData('footprint.collection_metrics_no_supported')),
    ]);

    $collectionSlug = 'doodles-official';

    $data = Opensea::getNftCollectionFloorPrice($collectionSlug);

    expect($data)->toBeNull();
});

it('should not get floor price if data array response is empty', function () {
    Opensea::fake([
        'https:///api.opensea.io/api/v1/*' => Opensea::response(fixtureData('footprint.collection_metrics_empty_data')),
    ]);

    $collectionSlug = 'doodles-official';

    $data = Opensea::getNftCollectionFloorPrice($collectionSlug);

    expect($data)->toBeNull();
});

it('can get floor price for the collection', function () {
    Opensea::fake([
        'https:///api.opensea.io/api/v1/*' => Opensea::response(fixtureData('footprint.collection_metrics')),
    ]);

    $collectionSlug = 'doodles-official';

    $data = Opensea::getNftCollectionFloorPrice($collectionSlug);

    expect($data)->toBeInstanceOf(Web3NftCollectionFloorPrice::class);
});
