<?php

declare(strict_types=1);

use App\Enums\Chains;
use App\Exceptions\NotImplementedException;
use App\Jobs\Middleware\RateLimited;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Token;
use App\Models\Wallet;
use App\Services\Web3\Mnemonic\MnemonicWeb3DataProvider;
use App\Support\Facades\Mnemonic;
use Illuminate\Support\Facades\Http;

it('can get nft floor price', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price'), 200),
    ]);

    $collection = Collection::factory()->create();

    $provider = new MnemonicWeb3DataProvider();
    $floorPrice = $provider->getNftCollectionFloorPrice(Chains::Polygon, $collection->address);
    expect($floorPrice->price)->toBe('10267792581881993')
        ->and($floorPrice->currency)->toBe('matic');
});

it('can get nft floor price and lookup fungible token', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price'), 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network,
        'address' => '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        'decimals' => 18,
        'symbol' => 'WETH',
    ]);

    $provider = new MnemonicWeb3DataProvider();
    $floorPrice = $provider->getNftCollectionFloorPrice(Chains::Polygon, $collection->address);
    expect($floorPrice->price)->toBe('6000000000000')
        ->and($floorPrice->currency)->toBe('weth');
});

it('can handle missing nft floor price', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price_null'), 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $provider = new MnemonicWeb3DataProvider();
    expect($provider->getNftCollectionFloorPrice(Chains::Polygon, $collection->address))
        ->toBeNull();
});

it('throws a not implemented exception when trying to fetch ENS domain', function () {
    (new MnemonicWeb3DataProvider)->getEnsDomain(
        Wallet::factory()->create()
    );
})->throws(NotImplementedException::class);

it('throws a not implemented exception when trying to fetch wallet tokens', function () {
    (new MnemonicWeb3DataProvider)->getWalletTokens(
        Wallet::factory()->create(), Network::factory()->create()
    );
})->throws(NotImplementedException::class);

it('throws a not implemented exception when trying to fetch NFTs for a wallet', function () {
    (new MnemonicWeb3DataProvider)->getWalletNfts(
        Wallet::factory()->create(), Network::factory()->create()
    );
})->throws(NotImplementedException::class);

it('should return rate limited middleware', function () {
    $middleware = (new MnemonicWeb3DataProvider())->getMiddleware();

    expect($middleware)->toHaveCount(1)
        ->and($middleware[0])->toBeInstanceOf(RateLimited::class);
});

it('throws a not implemented exception when trying to fetch native balance', function () {
    (new MnemonicWeb3DataProvider)->getNativeBalance(
        Wallet::factory()->create(), Network::factory()->create()
    );
})->throws(NotImplementedException::class);

it('should getCollectionsNfts and throw NotImplementedException', function () {
    expect(function () {
        $provider = new MnemonicWeb3DataProvider();
        $provider->getCollectionsNfts(Collection::factory()->create(), null);
    })->toThrow(NotImplementedException::class);
});

it('should throw an exception trying to fetch the block creation date', function () {
    $network = Network::polygon();

    $provider = new MnemonicWeb3DataProvider();

    expect(fn () => $provider->getBlockTimestamp($network, blockNumber: 10000))->toThrow(NotImplementedException::class);
});
