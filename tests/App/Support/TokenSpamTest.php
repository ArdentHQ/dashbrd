<?php

declare(strict_types=1);

use App\Models\CoingeckoToken;
use App\Models\Network;
use App\Models\Token;
use App\Support\TokenSpam;

it('evaluates spam token', function () {
    config(['dashbrd.token_spam.filter_type' => 'default']);

    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $token = Token::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
        'network_id' => $mainNetwork->id,
    ]);

    $tokenWithVeryLongSymbol = Token::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => fake()->sentence(5),
        'network_id' => $mainNetwork->id,
    ]);

    $tokenWithVeryLongName = Token::factory()->create([
        'name' => fake()->sentence(10),
        'symbol' => 'BRDY2',
        'network_id' => $mainNetwork->id,
    ]);

    expect(TokenSpam::evaluate($token))->toEqual(['isSpam' => false, 'reason' => null])
        ->and(TokenSpam::evaluate($tokenWithVeryLongSymbol))->toEqual(['isSpam' => true, 'reason' => 'symbol too long'])
        ->and(TokenSpam::evaluate($tokenWithVeryLongName))->toEqual(['isSpam' => true, 'reason' => 'name too long']);

    // This will not match name + symbol combination
    CoingeckoToken::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
    ]);

    expect(TokenSpam::evaluate($token))->toEqual(['isSpam' => false, 'reason' => null])
        ->and(TokenSpam::evaluate($tokenWithVeryLongSymbol))->toEqual(['isSpam' => true, 'reason' => 'symbol too long'])
        ->and(TokenSpam::evaluate($tokenWithVeryLongName))->toEqual(['isSpam' => true, 'reason' => 'name too long']);

    // Update token so it matches the coingecko one
    $tokenWithVeryLongName->name = 'BRDY2 TOKEN';
    $tokenWithVeryLongName->save();

    expect(TokenSpam::evaluate($token))->toEqual(['isSpam' => false, 'reason' => null])
        ->and(TokenSpam::evaluate($tokenWithVeryLongSymbol))->toEqual(['isSpam' => true, 'reason' => 'symbol too long'])
        ->and(TokenSpam::evaluate($tokenWithVeryLongName))->toEqual(['isSpam' => false, 'reason' => null]);
});

it('evaluates mainnet tokens network if they appear on Coingecko', function () {
    $polygonNetwork = Network::where('chain_id', 137)->firstOrfail();
    $ethereumNetwork = Network::where('chain_id', 1)->firstOrfail();

    $invalidPolygonToken = Token::factory()->create([
        'name' => 'Apecoin',
        'symbol' => 'APE',
        'address' => '0x01',
        'network_id' => $polygonNetwork->id,
    ]);

    $invalidEthereumToken = Token::factory()->create([
        'name' => 'Apecoin',
        'symbol' => 'APE',
        'address' => '0x02',
        'network_id' => $ethereumNetwork->id,
    ]);

    CoingeckoToken::factory()->create([
        'name' => 'Apecoin',
        'symbol' => 'APE',
        'platforms' => json_encode([
            'polygon-pos' => '0x0',
            'ethereum' => '0x1',
        ]),
    ]);

    expect(TokenSpam::evaluate($invalidPolygonToken))->toEqual(['isSpam' => true, 'reason' => 'coingecko address mismatch'])->and(TokenSpam::evaluate($invalidEthereumToken))->toEqual(['isSpam' => true, 'reason' => 'coingecko address mismatch']);

});

it('evaluates Balancer spam token', function () {
    config(['dashbrd.token_spam.filter_type' => 'strict']);
    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $spamToken = Token::factory()->create([
        'name' => 'Balancer',
        'symbol' => 'BalancerV2.io',
        'network_id' => $mainNetwork->id,
    ]);

    $legitToken = Token::factory()->create([
        'name' => 'Balancer',
        'symbol' => 'BAL',
        'network_id' => $mainNetwork->id,
    ]);

    CoingeckoToken::factory()->create([
        'name' => 'Balancer',
        'symbol' => 'bal',
    ]);

    expect(TokenSpam::evaluate($spamToken))->toEqual(['isSpam' => true, 'reason' => 'coingecko mismatch'])
        ->and(TokenSpam::evaluate($legitToken))->toEqual(['isSpam' => false, 'reason' => null]);

    config(['dashbrd.token_spam.filter_type' => 'default']);
});

it('evaluates just name and symbol for testnet tokens', function () {
    config(['dashbrd.token_spam.filter_type' => 'strict']);
    $testNetwork = Network::where('is_mainnet', false)->firstOrfail();

    $spamTokenLongName = Token::factory()->create([
        'name' => fake()->sentence(10),
        'symbol' => 'TEST',
        'network_id' => $testNetwork->id,
    ]);

    $spamTokenLongSymbol = Token::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => fake()->sentence(5),
        'network_id' => $testNetwork->id,
    ]);

    expect(TokenSpam::evaluate($spamTokenLongName))->toEqual(['isSpam' => true, 'reason' => 'name too long'])
        ->and(TokenSpam::evaluate($spamTokenLongSymbol))->toEqual(['isSpam' => true, 'reason' => 'symbol too long']);

    config(['dashbrd.token_spam.filter_type' => 'default']);
});

it('ignores coingecko mismatch for testnet tokens', function () {
    config(['dashbrd.token_spam.filter_type' => 'strict']);
    $testNetwork = Network::where('is_mainnet', false)->firstOrfail();

    $spamTokenMismatch = Token::factory()->create([
        'name' => 'TEST',
        'symbol' => 'TEST',
        'network_id' => $testNetwork->id,
    ]);

    expect(TokenSpam::evaluate($spamTokenMismatch))->toEqual(['isSpam' => false, 'reason' => null]);

    config(['dashbrd.token_spam.filter_type' => 'default']);
});

it('evaluates tokens that do not match coingecko tokens by name and symbol', function () {
    config(['dashbrd.token_spam.filter_type' => 'strict']);

    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $spamToken = Token::factory()->create([
        'name' => 'Balancer',
        'symbol' => 'BalancerV2.io',
        'network_id' => $mainNetwork->id,
    ]);

    $spamToken2 = Token::factory()->create([
        'name' => 'AAVEPool.org',
        'symbol' => 'AAVE',
        'network_id' => $mainNetwork->id,
    ]);

    $legitToken = Token::factory()->create([
        'name' => 'Balancer',
        'symbol' => 'bal',
        'network_id' => $mainNetwork->id,
    ]);

    $legitToken2 = Token::factory()->create([
        'name' => 'AAVE',
        'symbol' => 'AAVE',
        'network_id' => $mainNetwork->id,
    ]);

    CoingeckoToken::factory()->create([
        'name' => 'Balancer',
        'symbol' => 'bal',
    ]);

    CoingeckoToken::factory()->create([
        'name' => 'AAVE',
        'symbol' => 'AAVE',
    ]);

    expect(TokenSpam::evaluate($spamToken))->toEqual(['isSpam' => true, 'reason' => 'coingecko mismatch'])
        ->and(TokenSpam::evaluate($spamToken2))->toEqual(['isSpam' => true, 'reason' => 'coingecko mismatch'])
        ->and(TokenSpam::evaluate($legitToken))->toEqual(['isSpam' => false, 'reason' => null])
        ->and(TokenSpam::evaluate($legitToken2))->toEqual(['isSpam' => false, 'reason' => null]);

    config(['dashbrd.token_spam.filter_type' => 'default']);
});

it('handles strict and non-strict modes', function () {
    config(['dashbrd.token_spam.filter_type' => 'default']);

    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $token = Token::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
        'network_id' => $mainNetwork->id,
    ]);

    $tokenWithVeryLongSymbol = Token::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => fake()->sentence(5),
        'network_id' => $mainNetwork->id,
    ]);

    // This will not match name + symbol combination
    CoingeckoToken::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
    ]);

    expect(TokenSpam::evaluate($token))->toEqual(['isSpam' => false, 'reason' => null])
        ->and(TokenSpam::evaluate($tokenWithVeryLongSymbol))->toEqual(['isSpam' => true, 'reason' => 'symbol too long']);

    config(['dashbrd.token_spam.filter_type' => 'strict']);

    expect(TokenSpam::evaluate($token))->toEqual(['isSpam' => false, 'reason' => null])
        ->and(TokenSpam::evaluate($tokenWithVeryLongSymbol))->toEqual(['isSpam' => true, 'reason' => 'coingecko mismatch']);

    config(['dashbrd.token_spam.filter_type' => 'default']);
});
