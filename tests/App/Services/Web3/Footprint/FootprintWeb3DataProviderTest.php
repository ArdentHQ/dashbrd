<?php

declare(strict_types=1);

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
use App\Enums\Chains;
use App\Exceptions\NotImplementedException;
use App\Jobs\Middleware\RateLimited;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Wallet;
use App\Services\Web3\Footprint\FootprintWeb3DataProvider;
use App\Support\Facades\Footprint;

it('should getNftCollectionFloorPrice', function () {
    Footprint::fake([
        'https://api.footprint.network/api/v2/*' => Footprint::response(fixtureData('footprint.collection_metrics_no_supported')),
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    $provider = new FootprintWeb3DataProvider();

    $data = $provider->getNftCollectionFloorPrice(Chains::ETH, $contractAddress);

    expect($data)->toBeNull();
});

it('should throw NotImplementedException for methods that require wallet and network', function ($method) {
    $wallet = WalletData::from(Wallet::factory()->create());
    $networkData = NetworkData::from(Network::polygon()->firstOrFail());

    $provider = new FootprintWeb3DataProvider();

    $provider->{$method}($wallet, $networkData);
})
->throws(NotImplementedException::class)
->with([
    'getWalletNfts',
]);

it('should getWalletTokens and throw NotImplementedException', function () {
    $network = Network::polygon()->firstOrFail();

    $provider = new FootprintWeb3DataProvider();

    $provider->getWalletTokens(Wallet::factory()->create(), $network);
})->throws(NotImplementedException::class);

it('should getBlockTimestamp and throw NotImplementedException', function () {
    $network = Network::polygon()->firstOrFail();

    $provider = new FootprintWeb3DataProvider();

    $provider->getBlockTimestamp($network, 1);
})->throws(NotImplementedException::class);

it('should getCollectionsNfts and throw NotImplementedException', function () {
    $collection = Collection::factory()->create();

    $provider = new FootprintWeb3DataProvider();

    $provider->getCollectionsNfts($collection, null);
})->throws(NotImplementedException::class);

it('should getEnsDomain and throw NotImplementedException', function () {
    (new FootprintWeb3DataProvider())->getEnsDomain(
        Wallet::factory()->create()
    );
})->throws(NotImplementedException::class);

it('should getNativeBalance and throw NotImplementedException', function () {
    (new FootprintWeb3DataProvider())->getNativeBalance(
        Wallet::factory()->create(), Network::factory()->create(),
    );
})->throws(NotImplementedException::class);

it('should return rate limited middleware', function () {
    $middleware = (new FootprintWeb3DataProvider())->getMiddleware();

    expect($middleware)->toHaveCount(1)
        ->and($middleware[0])->toBeInstanceOf(RateLimited::class);
});
