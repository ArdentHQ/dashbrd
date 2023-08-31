<?php

declare(strict_types=1);

use App\Models\Network;
use App\Models\Token;

it('should detect spam on token insert', function () {
    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $legitToken = Token::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
        'network_id' => $mainNetwork->id,
    ]);
    $this->assertDatabaseCount('spam_tokens', 0);

    $spamToken = Token::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => fake()->sentence(5),
        'network_id' => $mainNetwork->id,
    ]);
    $this->assertDatabaseCount('spam_tokens', 1);

    expect($legitToken->spamToken)->toBeNull()
        ->and($spamToken->spamToken)->not()->toBeNull();
});

it('should detect spam on token update', function () {
    $mainNetwork = Network::where('is_mainnet', true)->firstOrfail();

    $token = Token::factory()->create([
        'name' => 'BRDY2 TOKEN',
        'symbol' => 'BRDY2',
        'network_id' => $mainNetwork->id,
    ]);
    $this->assertDatabaseCount('spam_tokens', 0);

    $token->update([
        'symbol' => fake()->sentence(5),
    ]);
    $this->assertDatabaseCount('spam_tokens', 1);

    $token->update([
        'symbol' => 'OK',
    ]);
    $this->assertDatabaseCount('spam_tokens', 0);
});
