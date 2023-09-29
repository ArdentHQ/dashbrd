<?php

declare(strict_types=1);

use App\Exceptions\NotImplementedException;
use App\Jobs\Middleware\RateLimited;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Wallet;
use App\Services\Web3\Opensea\OpenseaWeb3DataProvider;
use App\Support\Facades\Opensea;

it('should getNftCollectionFloorPrice', function () {
    Opensea::fake([
        'https://api.footprint.network/api/v2/*' => Opensea::response(fixtureData('footprint.collection_metrics_no_supported')),
    ]);

    $collectionSlug = 'doodles-official';

    $provider = new OpenseaWeb3DataProvider();

    $data = $provider->getNftCollectionFloorPrice($collectionSlug);

    expect($data)->toBeNull();
});

it('should getWalletTokens and throw NotImplementedException', function () {
    $network = Network::polygon();

    $provider = new OpenseaWeb3DataProvider();

    $provider->getWalletTokens(Wallet::factory()->create(), $network);
})->throws(NotImplementedException::class);

it('should getBlockTimestamp and throw NotImplementedException', function () {
    $network = Network::polygon();

    $provider = new OpenseaWeb3DataProvider();

    $provider->getBlockTimestamp($network, 1);
})->throws(NotImplementedException::class);

it('should getWalletNfts and throw NotImplementedException', function () {
    $network = Network::polygon();

    $provider = new OpenseaWeb3DataProvider();

    $provider->getWalletNfts(Wallet::factory()->create(), $network);
})->throws(NotImplementedException::class);

it('should getCollectionsNfts and throw NotImplementedException', function () {
    $collection = Collection::factory()->create();

    $provider = new OpenseaWeb3DataProvider();

    $provider->getCollectionsNfts($collection, null);
})->throws(NotImplementedException::class);

it('should getEnsDomain and throw NotImplementedException', function () {
    (new OpenseaWeb3DataProvider())->getEnsDomain(
        Wallet::factory()->create()
    );
})->throws(NotImplementedException::class);

it('should getNativeBalance and throw NotImplementedException', function () {
    (new OpenseaWeb3DataProvider())->getNativeBalance(
        Wallet::factory()->create(), Network::factory()->create(),
    );
})->throws(NotImplementedException::class);

it('should return rate limited middleware', function () {
    $middleware = (new OpenseaWeb3DataProvider())->getMiddleware();

    expect($middleware)->toHaveCount(1)
        ->and($middleware[0])->toBeInstanceOf(RateLimited::class);
});
