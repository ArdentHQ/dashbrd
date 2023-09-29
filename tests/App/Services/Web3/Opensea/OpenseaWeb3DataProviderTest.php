<?php

declare(strict_types=1);

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Enums\Chains;
use App\Exceptions\NotImplementedException;
use App\Jobs\Middleware\RateLimited;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Wallet;
use App\Services\Web3\Opensea\OpenseaWeb3DataProvider;
use App\Support\Facades\Opensea;

it('should getNftCollectionFloorPrice if no open sea slug', function () {
    Collection::factory()->create([
        'address' => '0x23581767a106ae21c074b2276D25e5C3e136a68b',
        'network_id' => Network::where('chain_id', Chains::ETH->value)->first()->id,
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    $provider = new OpenseaWeb3DataProvider();

    $data = $provider->getNftCollectionFloorPrice(Chains::ETH, $contractAddress);

    expect($data)->toBeNull();
});

it('should getNftCollectionFloorPrice  ', function () {
    Collection::factory()->create([
        'address' => '0x23581767a106ae21c074b2276D25e5C3e136a68b',
        'network_id' => Network::where('chain_id', Chains::ETH->value)->first()->id,
        'extra_attributes' => ['opensea_slug' => 'testy'],
    ]);

    Opensea::fake([
        'https://api.opensea.io/api/v1/collection*' => Opensea::response(fixtureData('opensea.collection_stats')),
    ]);

    $contractAddress = '0x23581767a106ae21c074b2276D25e5C3e136a68b';

    $provider = new OpenseaWeb3DataProvider();

    $data = $provider->getNftCollectionFloorPrice(Chains::ETH, $contractAddress);

    expect($data)->toBeInstanceOf(Web3NftCollectionFloorPrice::class);
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
