<?php

declare(strict_types=1);

use App\Jobs\FetchNativeBalances;
use App\Models\Balance;
use App\Models\Network;
use App\Models\Token;
use App\Models\Wallet;
use App\Support\Facades\Moralis;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Http;

it('should fetch native balance for a wallet', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.native-multiple'), 200),
    ]);

    $network = Network::polygon()->firstOrFail();

    $wallet1 = Wallet::factory()->create([
        'address' => '0x123',
    ]);

    $wallet2 = Wallet::factory()->create([
        'address' => '0x123A',
    ]);

    $wallet3 = Wallet::factory()->create([
        'address' => '0xABC',
    ]);

    $token = Token::factory()->create([
        'network_id' => $network->id,
        'is_native_token' => true,
    ]);

    $this->assertDatabaseCount('tokens', 1);
    $this->assertDatabaseCount('balances', 0);

    (new FetchNativeBalances(collect([$wallet1, $wallet2, $wallet3]), $network))->handle();

    expect($wallet1->findBalance($token)->balance)->toBeString("28499206466583095")
        ->and($wallet2->findBalance($token)->balance)->toBeString("0");

    $this->assertDatabaseCount('balances', 2);
});

it('does not fire a job to index transactions if balance is already synced', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.native-multiple'), 200),
    ]);

    $network = Network::polygon()->firstOrFail();
    $wallet = Wallet::factory()->create([
        'address' => '0x123'
    ]);

    $nativeToken = Token::factory()->create([
        'network_id' => $network->id,
        'is_native_token' => true,
    ]);

    Balance::factory()->create([
        'wallet_id' => $wallet->id,
        'token_id' => $nativeToken->id,
    ]);

    $this->assertDatabaseCount('tokens', 1);
    $this->assertDatabaseCount('balances', 1);

    (new FetchNativeBalances($wallet, $network))->handle();

    $this->assertDatabaseCount('tokens', 1);
    $this->assertDatabaseCount('balances', 1);
});

it('should fail the job if network has no native token', function () {
    $network = Network::factory()->create();
    $wallet = Wallet::factory()->create();

    expect(fn () => (new FetchNativeBalances($wallet, $network))->handle())
        ->toThrow(ModelNotFoundException::class);
});

it('should use the wallet id as a unique job identifier', function () {
    $network = Network::factory()->create([
        'chain_id' => 45
    ]);

    $wallet1 = Wallet::factory()->create([
        'id' => 35
    ]);

    $wallet2 = Wallet::factory()->create([
        'id' => 2,
    ]);

    $uniqueId = (new FetchNativeBalances(collect([$wallet1, $wallet2]), $network))->uniqueId();

    expect($uniqueId)->toBe("App\Jobs\FetchNativeBalances:45:2-35");
});

it('has a retry until', function () {
    $network = Network::factory()->create();
    $wallet = Wallet::factory()->create();

    $job = new FetchNativeBalances($wallet, $network);

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});
