<?php

declare(strict_types=1);

use App\Enums\Chains;
use App\Models\Network;
use App\Models\Token;

it('can create a basic network', function () {
    $network = Network::factory()->create();

    expect($network->name)->not()->toBeNull();
});

it('can retrieve the tokens assigned to the network', function () {
    $network = Network::factory()->create();

    expect($network->tokens()->count())->toBe(0);

    Token::factory()->create([
        'network_id' => $network->id,
    ]);

    expect($network->tokens()->count())->toBe(1);
});

it('can get the chain instance from the network', function () {
    $network = new Network([
        'chain_id' => Chains::Polygon->value,
    ]);

    expect($network->chain())->toBe(Chains::Polygon);
});

it('can get the native token for the network', function () {
    $network = Network::factory()->create();

    $nativeToken = Token::factory()->create([
        'network_id' => $network->id,
        'is_native_token' => true,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'is_native_token' => false,
    ]);

    $otherNetwork = Network::factory()->create();

    $otherNativeToken = Token::factory()->create([
        'network_id' => $otherNetwork->id,
        'is_native_token' => true,
    ]);

    expect($network->nativeToken->is($nativeToken))->toBeTrue();
    expect($otherNetwork->nativeToken->is($otherNativeToken))->toBeTrue();
});

it('can get only mainnet networks', function () {
    Network::all()->each->delete();

    Network::factory(count: 2)->create([
        'is_mainnet' => true,
    ]);

    $testnet = Network::factory()->create([
        'is_mainnet' => false,
    ]);

    $networks = Network::onlyMainnet()->get();

    expect($networks->count())->toBe(2);
    expect($networks->contains($testnet))->toBeFalse();
});

it('can only get active networks', function () {
    Network::all()->each->delete();

    Network::factory(count: 2)->create([
        'is_mainnet' => true,
    ]);

    $testnet = Network::factory()->create([
        'is_mainnet' => false,
    ]);

    config(['dashbrd.testnet_enabled' => false]);

    $networks = Network::onlyActive()->get();

    expect($networks->count())->toBe(2);
    expect($networks->contains($testnet))->toBeFalse();

    config(['dashbrd.testnet_enabled' => true]);

    $networks = Network::onlyActive()->get();

    expect($networks->count())->toBe(3);
    expect($networks->contains($testnet))->toBeTrue();
});
