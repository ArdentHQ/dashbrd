<?php

declare(strict_types=1);

use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftData;
use App\Exceptions\NotImplementedException;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
use App\Models\Wallet;
use App\Services\Web3\Fake\FakeWeb3DataProvider;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

it('should getWalletTokens', function () {
    $network = Network::polygon()->firstOrFail();

    $dbTokens = Token::factory(5)->create(['network_id' => $network->id]);

    $wallet = Wallet::factory()->create();

    $provider = new FakeWeb3DataProvider();

    $tokens = $provider->getWalletTokens($wallet, $network);
    expect($tokens->count())->toEqual(count($dbTokens));
    $tokens->each(function ($token) {
        expect($token)->toBeInstanceOf(Web3Erc20TokenData::class);
    });
});

it('should getWalletNfts', function () {
    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create(['network_id' => $network->id]);
    $dbNfts = Nft::factory(5)->create(['collection_id' => $collection->id]);

    $wallet = Wallet::factory()->create();

    $provider = new FakeWeb3DataProvider();

    $nfts = $provider->getWalletNfts($wallet, $network)->nfts;
    expect($nfts->count())->toEqual(count($dbNfts));
    $nfts->each(function ($nft) {
        expect($nft)
            ->toBeInstanceOf(Web3NftData::class)
            ->and($nft->floorPrice)
            ->toBeInstanceOf(Web3NftCollectionFloorPrice::class);
    });
});

it('should getCollectionsNfts and throw NotImplementedException', function () {
    expect(function () {
        $provider = new FakeWeb3DataProvider();
        $provider->getCollectionsNfts(Collection::factory()->create(), null);
    })->toThrow(NotImplementedException::class);
});

it('should getEnsDomain ', function () {
    $wallet = Wallet::factory()->create();

    $provider = new FakeWeb3DataProvider();

    $domain = $provider->getEnsDomain($wallet);
    expect($domain === null || is_string($domain))->toBeTrue();
});

it('should getEnsDomain from cache', function () {
    $wallet = Wallet::factory()->create();

    Cache::shouldReceive('rememberForever')
        ->with('fake-wallet-ens-'.$wallet->address, \Mockery::any())
        ->once()
        ->andReturn('test.eth');

    $provider = new FakeWeb3DataProvider();

    expect($provider->getEnsDomain($wallet))->toEqual('test.eth');
});

it('should get native balance', function () {
    $wallet = Wallet::factory()->create();
    $network = Network::polygon()->firstOrFail();

    $provider = new FakeWeb3DataProvider();

    expect($provider->getNativeBalance($wallet, $network))->toBeString();
});

it('should return no middleware', function () {
    expect((new FakeWeb3DataProvider())->getMiddleware())->toBe([]);
});

it('should get block creation date', function () {
    $network = Network::factory()->create();

    $provider = new FakeWeb3DataProvider();

    expect($provider->getBlockTimestamp($network, blockNumber: 10000))->toBeInstanceOf(Carbon::class);
});
