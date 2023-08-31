<?php

declare(strict_types=1);

use App\Data\NetworkData;
use App\Data\Wallet\WalletData;
use App\Data\Web3\Web3Erc20TokenData;
use App\Http\Client\Alchemy\AlchemyUnknownChainException;
use App\Models\Network;
use App\Models\Token;
use App\Models\Wallet;
use App\Support\Facades\Alchemy;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

it('can use the facade', function () {
    Alchemy::fake(function (Request $request) {
        $body = json_decode($request->body(), true);
        $method = $body['method'];
        $params = $body['params'];

        return match ($method) {
            'alchemy_getTokenBalances' => Http::response(fixtureData('alchemy.erc20'), 200),
            'alchemy_getTokenMetadata' => Http::response(fixtureData('alchemy.token_metadata_'.$params[0]), 200),
            default => Http::response(null, 404),
        };
    });

    $networkData = NetworkData::from(Network::polygon()->firstOrFail());

    $walletData = WalletData::fromModel(Wallet::factory()->create());

    $data = Alchemy::erc20($walletData, $networkData);

    expect($data)->toBeInstanceOf(Collection::class);

    expect($data)->toHaveCount(5);

    expect($data[0])->toBeInstanceOf(Web3Erc20TokenData::class);

    expect($data[0]->tokenAddress)->toBe('0x01e849040c418c3b7f130351a6e4630c08a7d98e');
});

it('reuses existing token metadata', function () {
    Alchemy::fake(function (Request $request) {
        $body = json_decode($request->body(), true);
        $method = $body['method'];
        $params = $body['params'];

        return match ($method) {
            'alchemy_getTokenBalances' => Http::response(fixtureData('alchemy.erc20'), 200),
            'alchemy_getTokenMetadata' => Http::response(fixtureData('alchemy.token_metadata_'.$params[0]), 200),
            default => Http::response(null, 404),
        };
    });

    $network = Network::polygon()->firstOrFail();

    $walletData = WalletData::fromModel(Wallet::factory()->create());

    Token::factory()->createMany([
        ['network_id' => $network->id, 'address' => '0x01e849040c418c3b7f130351a6e4630c08a7d98e'],
        ['network_id' => $network->id, 'address' => '0x054f76beed60ab6dbeb23502178c52d6c5debe40'],
        // ['network_id' => $network->id,'address' => '0x094c4361d2becd02330c9c2230d730f347bd402e'],
        // ['network_id' => $network->id,'address' => '0x1234567890123456789012345678901234567890'],
        // ['network_id' => $network->id,'address' => '0x08130635368aa28b217a4dfb68e1bf8dc525621c'],
    ]);

    $data = Alchemy::erc20($walletData, NetworkData::from($network));
    Alchemy::assertSentCount(4); // 1 erc20 call plus 3 metadata look ups

    expect($data)->toBeInstanceOf(Collection::class);
    expect($data)->toHaveCount(5); // returns 5 tokens in total

    // create remaining tokens
    Token::factory()->createMany([
        ['network_id' => $network->id, 'address' => '0x094c4361d2becd02330c9c2230d730f347bd402e'],
        ['network_id' => $network->id, 'address' => '0x1234567890123456789012345678901234567890'],
        ['network_id' => $network->id, 'address' => '0x08130635368aa28b217a4dfb68e1bf8dc525621c'],
    ]);

    $data = Alchemy::erc20($walletData, NetworkData::from($network));
    Alchemy::assertSentCount(5); // just 1 additional erc20 call plus 0 metadata lookups

    expect($data)->toBeInstanceOf(Collection::class);
    expect($data)->toHaveCount(5); // returns 5 tokens in total
});

it('handles missing token metadata', function () {
    Alchemy::fake(function (Request $request) {
        $body = json_decode($request->body(), true);
        $method = $body['method'];

        return match ($method) {
            'alchemy_getTokenBalances' => Http::response(fixtureData('alchemy.erc20_non_existent'), 200),
            'alchemy_getTokenMetadata' => Http::response('', 404),
            default => Http::response(null, 404),
        };
    });

    $networkData = NetworkData::from(Network::polygon()->firstOrFail());

    $walletData = WalletData::fromModel(Wallet::factory()->create());

    $data = Alchemy::erc20($walletData, $networkData);

    expect($data)->toBeInstanceOf(Collection::class);

    expect($data)->toHaveCount(0);
});

it('rethrows on unexpected error', function () {
    Alchemy::fake(function (Request $request) {
        $body = json_decode($request->body(), true);
        $method = $body['method'];

        return match ($method) {
            'alchemy_getTokenBalances' => Http::response(fixtureData('alchemy.erc20_non_existent'), 200),
            'alchemy_getTokenMetadata' => Http::response('', 403),
            default => Http::response(null, 404),
        };
    });

    $networkData = NetworkData::from(Network::polygon()->firstOrFail());

    $walletData = WalletData::fromModel(Wallet::factory()->create());

    Alchemy::erc20($walletData, $networkData);
})->throws(ClientException::class);

it('throws if unknown chain', function () {
    Alchemy::send('get', '');
})->throws(AlchemyUnknownChainException::class);
