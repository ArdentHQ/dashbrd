<?php

declare(strict_types=1);

use App\Models\CoingeckoToken;
use App\Models\Network;
use App\Models\Token;

it('should do nothing on soft delete when no token exists', function () {
    $coingeckoToken = CoingeckoToken::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
    ]);

    $this->assertDatabaseCount('tokens', 0);

    $coingeckoToken->delete();
    expect($coingeckoToken->trashed());
    $this->assertDatabaseCount('spam_tokens', 0);
});

it('should do nothing on restore when no token exists', function () {
    $coingeckoToken = CoingeckoToken::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
    ]);

    $this->assertDatabaseCount('tokens', 0);

    $coingeckoToken->delete();
    expect($coingeckoToken->trashed());
    $this->assertDatabaseCount('spam_tokens', 0);

    $coingeckoToken->restore();
    expect($coingeckoToken->trashed());
    $this->assertDatabaseCount('spam_tokens', 0);
});

it('should remove spam status on creation', function () {
    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $token = Token::factory()->withGuid('testy')->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => fake()->sentence(5),
        'network_id' => $mainNetwork->id,
    ]);

    $this->assertDatabaseCount('spam_tokens', 1);
    expect($token->refresh()->spamToken->reason)->toBe('symbol too long');

    $coingeckoToken = CoingeckoToken::factory()->create([
        'name' => $token->name,
        'symbol' => $token->symbol,
        'coingecko_id' => 'testy',
    ]);

    $this->assertDatabaseCount('spam_tokens', 0);
    expect($token->refresh()->spamToken)->toBeNull();

    $coingeckoToken->delete();
    expect($coingeckoToken->trashed())->toBeTrue();

    $this->assertDatabaseCount('spam_tokens', 1);
    expect($token->spamToken())
        ->not()
        ->toBeNull()
        ->and($token->spamToken()->getResults()->reason)
        ->toBe('trashed');

    $coingeckoToken->restore();
    expect($coingeckoToken->trashed())->toBeFalse();

    $this->assertDatabaseCount('spam_tokens', 0);
    expect($token->spamToken)->toBeNull();
});

it('should detect spam on token soft delete', function () {
    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $token = Token::factory()->withGuid('testy')->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
        'network_id' => $mainNetwork->id,
    ]);

    $coingeckoToken = CoingeckoToken::factory()->create([
        'name' => $token->name,
        'symbol' => $token->symbol,
        'coingecko_id' => 'testy',
    ]);

    $this->assertDatabaseCount('spam_tokens', 0);
    expect($token->spamToken)->toBeNull();

    $coingeckoToken->delete();
    expect($coingeckoToken->trashed())->toBeTrue();

    $this->assertDatabaseCount('spam_tokens', 1);

    expect($token->spamToken())
        ->not()
        ->toBeNull()
        ->and($token->spamToken()->getResults()->reason)
        ->toBe('trashed');
});

it('should rerun spam detection on token restore and remove status', function () {
    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $token = Token::factory()->withGuid('testy')->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
        'network_id' => $mainNetwork->id,
    ]);

    $coingeckoToken = CoingeckoToken::factory()->create([
        'name' => $token->name,
        'symbol' => $token->symbol,
        'coingecko_id' => 'testy',
    ]);

    $this->assertDatabaseCount('spam_tokens', 0);
    expect($token->spamToken)->toBeNull();

    $coingeckoToken->delete();
    expect($coingeckoToken->trashed())->toBeTrue();

    $this->assertDatabaseCount('spam_tokens', 1);
    expect($token->spamToken())
        ->not()
        ->toBeNull()
        ->and($token->spamToken()->getResults()->reason)
        ->toBe('trashed');

    $coingeckoToken->restore();
    expect($coingeckoToken->trashed())->toBeFalse();

    $this->assertDatabaseCount('spam_tokens', 0);
    expect($token->spamToken)->toBeNull();
});
