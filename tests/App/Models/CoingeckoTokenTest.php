<?php

declare(strict_types=1);

use App\Models\CoingeckoToken;
use App\Models\Network;
use App\Models\Token;

it('should lookupByToken with platform', function () {
    $network = Network::polygon();

    $token = Token::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->create([
        'symbol' => 'ASDF',
        'name' => 'asdf',
        'platforms' => json_encode(['polygon-pos' => $token['address']]),
    ]);

    $coingeckoToken = CoingeckoToken::lookupByToken($token);
    expect($coingeckoToken)->not()->toBeNull();
});

it('should lookupByToken with name and symbol combination', function () {
    $network = Network::polygon();

    $token = Token::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'platforms' => json_encode([]),
    ]);

    $coingeckoToken = CoingeckoToken::lookupByToken($token);
    expect($coingeckoToken)->not()->toBeNull();
});

it('should not lookupByToken with name when already used by another token', function () {
    $network = Network::polygon();

    $tokenLegit = Token::factory()->create([
        'symbol' => 'BAL',
        'name' => 'Balancer',
        'network_id' => $network->id,
    ]);

    $tokenSpam = Token::factory()->create([
        'symbol' => 'BalancerV2.io',
        'name' => 'Balancer',
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->create([
        'symbol' => 'bal',
        'name' => 'Balancer',
        'platforms' => json_encode([]),
    ]);

    // doesn't work
    $coingeckoToken = CoingeckoToken::lookupByToken($tokenSpam);
    expect($coingeckoToken)->toBeNull();

    // still works
    $coingeckoToken = CoingeckoToken::lookupByToken($tokenLegit);
    expect($coingeckoToken)->not()->toBeNull();
});

it('should lookupByToken by guid', function () {
    $network = Network::polygon();

    $token = Token::factory()->withGuid('testy')->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->create([
        'coingecko_id' => 'testy',
    ]);

    $coingeckoToken = CoingeckoToken::lookupByToken($token);
    expect($coingeckoToken)->not()->toBeNull();
});

it('should lookupByToken and handle duplicate platforms', function () {
    $network = Network::polygon();

    $token = Token::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->createMany([[
        'coingecko_id' => '1',
        'symbol' => 'ASDF',
        'name' => 'asdf',
        'platforms' => json_encode(['polygon-pos' => $token['address']]),
    ], [
        'coingecko_id' => '2',
        'symbol' => 'ASDF',
        'name' => 'asdf',
        'platforms' => json_encode(['polygon-pos' => $token['address']]),
    ]]);

    $coingeckoToken = CoingeckoToken::lookupByToken($token);
    expect($coingeckoToken['coingecko_id'])->toBe('1');
});

it('should lookupByToken and handle duplicate symbols', function () {
    $network = Network::polygon();

    $token = Token::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->createMany([[
        'coingecko_id' => '1',
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'platforms' => json_encode([]),
    ], [
        'coingecko_id' => '2',
        'symbol' => 'MATIC',
        'name' => 'asdf',
        'platforms' => json_encode([]),
    ]]);

    $coingeckoToken = CoingeckoToken::lookupByToken($token);
    expect($coingeckoToken['coingecko_id'])->toBe('1');
});

it('should lookupByToken and handle duplicate names', function () {
    $network = Network::polygon();

    $token = Token::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->createMany([[
        'coingecko_id' => '1',
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'platforms' => json_encode([]),
    ], [
        'coingecko_id' => '2',
        'symbol' => 'ASDF',
        'name' => 'Polygon',
        'platforms' => json_encode([]),
    ]]);

    $coingeckoToken = CoingeckoToken::lookupByToken($token);
    expect($coingeckoToken['coingecko_id'])->toBe('1');
});

it('should lookupByToken and sort duplicates', function () {
    $network = Network::polygon();

    $token = Token::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'network_id' => $network->id,
    ]);

    CoingeckoToken::factory()->createMany([[
        'coingecko_id' => '1',
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'platforms' => json_encode([]),
        'duplicated' => true, // default
    ], [
        'coingecko_id' => '2',
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'platforms' => json_encode([]),
        'duplicated' => false, // default
    ]]);

    $coingeckoToken = CoingeckoToken::lookupByToken($token);
    expect($coingeckoToken['coingecko_id'])->toBe('2');
});

it('should return null when lookupByToken when table empty', function () {
    $network = Network::polygon();

    $token = Token::factory()->create([
        'symbol' => 'MATIC',
        'network_id' => $network->id,
    ]);

    $coingeckoToken = CoingeckoToken::lookupByToken($token);
    expect($coingeckoToken)->toBeNull();
});
