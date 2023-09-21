<?php

declare(strict_types=1);

use App\Jobs\FetchTokens;
use App\Models\Balance;
use App\Models\Network;
use App\Models\Token;
use App\Models\Wallet;
use App\Support\Facades\Moralis;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

it('should fetch tokens for wallet', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.erc20'), 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('tokens', 0);
    $this->assertDatabaseCount('balances', 0);

    (new FetchTokens($wallet, $network))->handle();

    $this->assertDatabaseCount('tokens', 3);
    $this->assertDatabaseCount('balances', 3);
});

it('should delete tokens balances that are no longer present', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.erc20'), 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    // Present in the response
    $first = Token::factory()->for($network)->create([
        'address' => '0xcab66b484123ecc93673b30d9e543b2204bf0369',
        'is_default_token' => false,
        'is_native_token' => false,
    ]);

    // Not present in the response
    $second = Token::factory()->for($network)->create([
        'address' => '0xOtherToken',
        'is_default_token' => false,
        'is_native_token' => false,
    ]);

    $wallet = Wallet::factory()->create();

    Balance::factory()->create([
        'wallet_id' => $wallet->id,
        'token_id' => $first->id,
    ]);

    Balance::factory()->create([
        'wallet_id' => $wallet->id,
        'token_id' => $second->id,
    ]);

    $this->assertDatabaseCount('tokens', 2);
    $this->assertDatabaseCount('balances', 2);

    expect($wallet->balances()->where('token_id', $second->id)->first())->not()->toBeNull();

    (new FetchTokens($wallet, $network))->handle();

    expect($wallet->balances()->where('token_id', $second->id)->first())->toBeNull();

    // The token is not deleted, only the balance
    $this->assertDatabaseCount('tokens', 4);
    $this->assertDatabaseCount('balances', 3);
});

it('should update tokens on change', function () {

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::sequence()
            ->push(fixtureData('moralis.erc20'), 200)
            ->push(fixtureData('moralis.erc20_update'), 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    expect(Token::bySymbol('BalancerV2.io')->first())->toBeNull()
        ->and(Token::bySymbol('BALANCERR')->first())->toBeNull();

    (new FetchTokens($wallet, $network))->handle();

    expect(Token::bySymbol('BalancerV2.io')->first())->not()->toBeNull()
        ->and(Token::bySymbol('BALANCERR')->first())->toBeNull();

    Cache::flush();
    (new FetchTokens($wallet, $network))->handle();

    $this->assertDatabaseCount('tokens', 3);
    $this->assertDatabaseCount('balances', 3);

    expect(Token::bySymbol('BalancerV2.io')->first())->toBeNull()
        ->and(Token::bySymbol('BALANCERR')->first())->not()->toBeNull();
});

it('does not fire a job to index transactions for tokens whose balance is already indexed', function () {

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.erc20'), 200),
    ]);

    $network = Network::polygon();

    $first = Token::factory()->for($network)->create([
        'address' => '0xcab66b484123ecc93673b30d9e543b2204bf0369',
        'is_default_token' => false,
        'is_native_token' => false,
    ]);

    $second = Token::factory()->for($network)->create([
        'address' => '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        'is_default_token' => false,
        'is_native_token' => false,
    ]);

    $missingToken = Token::factory()->for($network)->create([
        'address' => '0x6b175474e89094c44da98b954eedeac495271d0f',
        'is_default_token' => false,
        'is_native_token' => false,
    ]);

    $wallet = Wallet::factory()->create();

    Balance::factory()->create([
        'wallet_id' => $wallet->id,
        'token_id' => $first->id,
    ]);

    Balance::factory()->create([
        'wallet_id' => $wallet->id,
        'token_id' => $second->id,
    ]);

    $this->assertDatabaseCount('tokens', 3);
    $this->assertDatabaseCount('balances', 2);

    (new FetchTokens($wallet, $network))->handle();

    $this->assertDatabaseCount('tokens', 3);
    $this->assertDatabaseCount('balances', 3);
});

it('does not store balances if all tokens have zero balance', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.erc20-spam'), 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('tokens', 0);
    $this->assertDatabaseCount('balances', 0);

    (new FetchTokens($wallet, $network))->handle();

    $this->assertDatabaseCount('tokens', 1);
    $this->assertDatabaseCount('balances', 0);
});

it('handles an empty token list for a wallet', function () {
    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    Moralis::shouldReceive('getWalletTokens')
        ->once()
        ->andReturn(collect());

    $this->assertDatabaseCount('tokens', 0);
    $this->assertDatabaseCount('balances', 0);

    (new FetchTokens($wallet, $network))->handle();

    $this->assertDatabaseCount('tokens', 0);
    $this->assertDatabaseCount('balances', 0);
});

it('should use the wallet id as a unique job identifier', function () {
    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    expect((new FetchTokens($wallet, $network)))->uniqueId()->toBeString();
});

it('has a retry until', function () {
    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $job = new FetchTokens($wallet, $network);

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});
