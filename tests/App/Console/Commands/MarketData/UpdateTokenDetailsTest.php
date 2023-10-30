<?php

declare(strict_types=1);

use App\Jobs\UpdateTokenDetails;
use App\Models\Balance;
use App\Models\Network;
use App\Models\Token;
use App\Models\Wallet;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for every token in the database', function () {
    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    Token::factory()->count(3)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details');

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 3);
});

it('dispatches a job for every token in the database using a limit', function () {
    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    Token::factory()->count(3)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        '--limit' => 2,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 2);
});

it('dispatches a job for every token in the database and skips some', function () {
    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    Token::factory()->count(3)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        '--skip' => 2,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 1);
});

it('dispatches a job for a single token', function () {
    Bus::fake([UpdateTokenDetails::class]);

    Token::factory()->count(3)->create();

    $network = Network::factory()->create(['is_mainnet' => true]);
    $subject = Token::factory()->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        'token_symbol' => $subject->symbol,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 1);
});

it('dispatches a job for all wallet tokens', function () {
    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    $wallet = Wallet::factory()->create();

    Token::factory()->count(1)->create(['network_id' => $network->id]);

    $tokens = Token::factory()->count(3)->create(['network_id' => $network->id]);

    $wallet->balances()->saveMany($tokens->map(static function (Token $token) use ($wallet) {
        return new Balance([
            'wallet_id' => $wallet['id'],
            'token_id' => $token['id'],
            'balance' => '0',
        ]);
    }));

    Token::factory()->count(2)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        '--wallet-id' => $wallet->id,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 3);
});

it('dispatches a job for all wallet tokens using a limit', function () {
    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    $wallet = Wallet::factory()->create();

    Token::factory()->count(1)->create(['network_id' => $network->id]);

    $tokens = Token::factory()->count(3)->create(['network_id' => $network->id]);

    $wallet->balances()->saveMany($tokens->map(static function (Token $token) use ($wallet) {
        return new Balance([
            'wallet_id' => $wallet['id'],
            'token_id' => $token['id'],
            'balance' => '0',
        ]);
    }));

    Token::factory()->count(2)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        '--wallet-id' => $wallet->id,
        '--limit' => 2,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 2);
});
