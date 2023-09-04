<?php

declare(strict_types=1);

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Enums\Chains;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Support\Facades\Footprint;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Http;

it('should throw a custom exception on internal server error', function () {
    Footprint::fake([
        'https://api.footprint.network/api/v2/*' => Http::response(null, 500),
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    Footprint::getNftCollectionFloorPrice(Chains::ETH, $contractAddress);
})->throws(ConnectionException::class);

it('should throw a custom exception when rate limited', function () {
    Footprint::fake([
        'https://api.footprint.network/api/v2/*' => Http::response(null, 429),
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    Footprint::getNftCollectionFloorPrice(Chains::ETH, $contractAddress);
})->throws(RateLimitException::class);

it('should throw a custom exception on client error', function () {
    Footprint::fake([
        'https://api.footprint.network/api/v2/*' => Http::response(null, 400),
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    Footprint::getNftCollectionFloorPrice(Chains::ETH, $contractAddress);
})->throws(ClientException::class);

it('should not get floor price if unable to process request', function () {
    Footprint::fake([
        'https://api.footprint.network/api/v2/*' => Footprint::response(fixtureData('footprint.collection_metrics_no_supported')),
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    $data = Footprint::getNftCollectionFloorPrice(Chains::ETH, $contractAddress);

    expect($data)->toBeNull();
});

it('should not get floor price if data array response is empty', function () {
    Footprint::fake([
        'https://api.footprint.network/api/v2/*' => Footprint::response(fixtureData('footprint.collection_metrics_empty_data')),
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    $data = Footprint::getNftCollectionFloorPrice(Chains::ETH, $contractAddress);

    expect($data)->toBeNull();
});

it('can get floor price for the collection', function () {
    Footprint::fake([
        'https://api.footprint.network/api/v2/*' => Footprint::response(fixtureData('footprint.collection_metrics')),
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    $data = Footprint::getNftCollectionFloorPrice(Chains::ETH, $contractAddress);

    expect($data)->toBeInstanceOf(Web3NftCollectionFloorPrice::class);
});
