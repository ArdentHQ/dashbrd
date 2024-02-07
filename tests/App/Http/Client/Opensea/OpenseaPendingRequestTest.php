<?php

declare(strict_types=1);

use App\Data\Web3\Web3CollectionFloorPrice;
use App\Enums\Chain;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Collection;
use App\Support\Facades\Opensea;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Http;

it('should throw a custom exception on internal server error', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Http::response(null, 500),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getCollectionFloorPrice($collectionSlug);
})->throws(ConnectionException::class);

it('should throw a custom exception when rate limited', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Http::response(null, 429),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getCollectionFloorPrice($collectionSlug);
})->throws(RateLimitException::class);

it('should throw a custom exception on client error', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Http::response(null, 400),
    ]);

    $collectionSlug = 'doodles-official';

    Opensea::getCollectionFloorPrice($collectionSlug);
})->throws(ClientException::class);

it('can get floor price for the collection', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Opensea::response(fixtureData('opensea.collection_stats')),
    ]);

    $collectionSlug = 'doodles-official';

    $data = Opensea::getCollectionFloorPrice($collectionSlug);

    expect($data)->toBeInstanceOf(Web3CollectionFloorPrice::class);
});

it('can get nft collection slug', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2*' => Opensea::response(fixtureData('opensea.nft')),
    ]);

    $chain = Chain::Polygon;

    $address = '0x670fd103b1a08628e9557cd66b87ded841115190';

    $identifier = '2428';

    $data = Opensea::nft(
        chain: $chain,
        address: $address,
        identifier: $identifier
    );

    expect($data->collectionSlug())->toBe('y00ts');
});

it('handles not found exception', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2*' => Opensea::response(fixtureData('opensea.nft_not_found'), 400),
    ]);

    $chain = Chain::Polygon;

    $address = '0x670fd103b1a08628e9557cd66b87ded841115190';

    $identifier = '2428';

    $data = Opensea::nft(
        chain: $chain,
        address: $address,
        identifier: $identifier
    );

    expect($data)->toBeNull();
});

it('handles not found exception for nft', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2*' => Opensea::response('', 404),
    ]);

    $chain = Chain::Polygon;

    $address = '0x670fd103b1a08628e9557cd66b87ded841115190';

    $identifier = '2428';

    Opensea::nft(
        chain: $chain,
        address: $address,
        identifier: $identifier
    );
})->throws(ClientException::class);

it('can get total volume for a collection', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Opensea::response(fixtureData('opensea.collection_stats')),
    ]);

    $collection = new Collection([
        'address' => '0x670fd103b1a08628e9557cd66b87ded841115190',
        'extra_attributes' => [
            'opensea_slug' => 'test',
        ],
    ]);

    expect(Opensea::getCollectionTotalVolume($collection))->toBe('288921605076300000000000');
});

it('can get total volume for a collection, if the total volume is 0', function () {
    $response = fixtureData('opensea.collection_stats');

    $response['total']['volume'] = null;

    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Opensea::response($response),
    ]);

    $collection = new Collection([
        'address' => '0x670fd103b1a08628e9557cd66b87ded841115190',
        'extra_attributes' => [
            'opensea_slug' => 'test',
        ],
    ]);

    expect(Opensea::getCollectionTotalVolume($collection))->toBeNull();
});
