<?php

declare(strict_types=1);

use App\Enums\Chain;
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

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    Moralis::getWalletTokens($wallet, $network);
})->throws(ConnectionException::class);

it('should throw a custom exception when rate limited', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(null, 429),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    Moralis::getWalletTokens($wallet, $network);
})->throws(RateLimitException::class);

it('should filter tokens that are possible spam', function () {
    $data = fixtureData('moralis.erc20');

    $data[1]['possible_spam'] = true;

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response($data),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    expect(Moralis::getWalletTokens($wallet, $network))->toHaveCount(2);
});

it('should not retry request on 400', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::sequence()
            ->push(null, 400)
            ->push(fixtureData('moralis.erc20'), 200),
    ]);

    $network = Network::polygon();

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    expect(fn () => Moralis::getWalletTokens($wallet, $network))->toThrow('400 Bad Request');
});

it('should return null on 404 when getting nft floor price', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/nft/*/lowestprice?*' => Http::response(null, 404),
    ]);

    expect(Moralis::getNftCollectionFloorPrice(Chain::ETH, '1'))->toBeNull();
});

it('should throw any non-404 error when getting nft floor price', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/nft/*/lowestprice?*' => Http::response(null, 400),
    ]);

    expect(fn () => Moralis::getNftCollectionFloorPrice(Chain::ETH, '1'))->toThrow('400 Bad Request');
});
