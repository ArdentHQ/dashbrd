<?php

declare(strict_types=1);

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Facades\Alchemy;
use Illuminate\Support\Facades\Http;

it('should throw a connection exception on server errors', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::response(null, 500),
    ]);

    $walletData = WalletData::fromModel(Wallet::factory()->create());
    $networkData = NetworkData::fromModel(Network::polygon()->firstOrFail());

    Alchemy::erc20($walletData, $networkData);
})->throws(ConnectionException::class);

it('should throw a custom exception on 429 status code', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::response(null, 429),
    ]);

    $walletData = WalletData::fromModel(Wallet::factory()->create());
    $networkData = NetworkData::fromModel(Network::polygon()->firstOrFail());

    Alchemy::erc20($walletData, $networkData);
})->throws(RateLimitException::class);

it('should not retry request on 400', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::sequence()
            ->push(null, 400)
            ->push(fixtureData('alchemy.erc20'), 200),
    ]);

    $walletData = WalletData::fromModel(Wallet::factory()->create());
    $networkData = NetworkData::fromModel(Network::polygon()->firstOrFail());

    expect(fn () => Alchemy::erc20($walletData, $networkData))->toThrow('400 Bad Request');
});

it('should handle arrays in NFT descriptions', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_description'), 200),
    ]);

    $walletData = WalletData::fromModel(Wallet::factory()->create());
    $networkData = NetworkData::fromModel(Network::polygon()->firstOrFail());

    expect(Alchemy::walletNfts($walletData, $networkData)->nfts[0]->description)->toBeString();
});
