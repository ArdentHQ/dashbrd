<?php

declare(strict_types=1);

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
use App\Enums\Chains;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Facades\Moralis;
use Illuminate\Support\Facades\Http;

it('should throw a custom connection exception on internal server error', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(null, 500),
    ]);

    $walletData = WalletData::fromModel(Wallet::factory()->create());
    $networkData = NetworkData::fromModel(Network::polygon()->firstOrFail());

    Moralis::erc20($walletData, $networkData);
})->throws(ConnectionException::class);

it('should throw a custom exception when rate limited', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(null, 429),
    ]);

    $walletData = WalletData::fromModel(Wallet::factory()->create());
    $networkData = NetworkData::fromModel(Network::polygon()->firstOrFail());

    Moralis::erc20($walletData, $networkData);
})->throws(RateLimitException::class);

it('should not retry request on 400', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::sequence()
            ->push(null, 400)
            ->push(fixtureData('moralis.erc20'), 200),
    ]);

    $network = Network::polygon()->firstOrFail();

    $walletData = WalletData::fromModel(Wallet::factory()->create());
    $networkData = NetworkData::fromModel(Network::polygon()->firstOrFail());

    expect(fn () => Moralis::erc20($walletData, $networkData))->toThrow('400 Bad Request');
});

it('should return null on 404 when getting nft floor price', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/nft/*/lowestprice?*' => Http::response(null, 404),
    ]);

    expect(Moralis::getNftCollectionFloorPrice(Chains::ETH, '1'))->toBeNull();
});

it('should throw any non-404 error when getting nft floor price', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/nft/*/lowestprice?*' => Http::response(null, 400),
    ]);

    expect(fn () => Moralis::getNftCollectionFloorPrice(Chains::ETH, '1'))->toThrow('400 Bad Request');
});
