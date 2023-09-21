<?php

declare(strict_types=1);

use App\Data\Web3\Web3Erc20TokenData;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Facades\Moralis;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

it('can use the facade', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.erc20'), 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $data = Moralis::getWalletTokens($wallet, $network);

    expect($data)->toBeInstanceOf(Collection::class);

    expect($data)->toHaveCount(3);

    expect($data[0])->toBeInstanceOf(Web3Erc20TokenData::class);

    expect($data[0]->tokenAddress)->toBe('0xcab66b484123ecc93673b30d9e543b2204bf0369');
});

it('can use the facade to resolve the ens domain', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.ens_resolve'), 200),
    ]);

    $wallet = Wallet::factory()->create();

    $data = Moralis::ensDomain($wallet);

    expect($data)->toBe('something.eth');
});

it('can use the facade to fetch the balance for a native coin', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.native'), 200),
    ]);

    $network = Network::polygon();

    $wallet = Wallet::factory()->create();

    $data = Moralis::getNativeBalance($wallet, $network);

    expect($data)->toBe('20000');
});

it('handles domain not resolved', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response([], 404),
    ]);

    $wallet = Wallet::factory()->create();

    $data = Moralis::ensDomain($wallet);

    expect($data)->toBeNull();
});

it('throws an exception for any other response', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response([], 403),
    ]);

    $wallet = Wallet::factory()->create();

    Moralis::ensDomain($wallet);
})->throws(ClientException::class);
