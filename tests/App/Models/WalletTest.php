<?php

declare(strict_types=1);

use App\Models\Balance;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;

it('can create a basic wallet', function () {
    $wallet = Wallet::factory()->create();

    expect($wallet->address)->not()->toBeNull();
});

it('loads the wallet tokens', function () {
    $wallet = Wallet::factory()->create();

    $tokens = Token::factory()->count(3)->create();

    $wallet->balances()->saveMany($tokens->map(static function (Token $token) use ($wallet) {
        return new Balance([
            'wallet_id' => $wallet['id'],
            'token_id' => $token['id'],
            'balance' => '0',
        ]);
    }));

    expect($wallet->tokens()->count())->toBe(3);
});

it('belongs to a user', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
    ]);

    expect($wallet->user->id)->toBe($user->id);
});

it('does not belong to a network when created', function () {
    $wallet = Wallet::factory()->create();

    expect($wallet->network)->toBeNull();
});

it('has nfts', function () {
    $network = Network::factory()->create();
    $wallet = Wallet::factory()->create();
    $nfts = Nft::factory(2)->create([
        'wallet_id' => $wallet->id,
    ]);

    expect($wallet->nfts)->toHaveLength(2);
});

it('can softdelete a wallet', function () {
    $wallet = Wallet::factory()->create();
    $address = $wallet->address;

    $this->assertDatabaseCount('wallets', 1);

    $this->assertDatabaseHas('wallets', [
        'address' => $address,
        'deleted_at' => null,
    ]);

    $wallet->delete();

    $this->assertDatabaseCount('wallets', 1);

    $this->assertDatabaseMissing('wallets', [
        'address' => $address,
        'deleted_at' => null,
    ]);
});

it('can restore a wallet', function () {
    $wallet = Wallet::factory()->create();
    $address = $wallet->address;

    $this->assertDatabaseCount('wallets', 1);

    $this->assertDatabaseHas('wallets', [
        'address' => $address,
        'deleted_at' => null,
    ]);

    $wallet->delete();

    $this->assertDatabaseCount('wallets', 1);

    $this->assertDatabaseMissing('wallets', [
        'address' => $address,
        'deleted_at' => null,
    ]);

    $wallet->restore();

    $this->assertDatabaseCount('wallets', 1);

    $this->assertDatabaseHas('wallets', [
        'address' => $address,
        'deleted_at' => null,
    ]);
});

it('filters recently active wallets', function () {
    $this->freezeTime();

    $active[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.active_threshold') - 1),
    ]);

    $active[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.active_threshold')),
    ]);

    $inactive[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.active_threshold') + 1),
    ]);

    $active[] = Wallet::factory()->create([
        'last_activity_at' => now(),
    ]);

    $inactive[] = Wallet::factory()->create([
        'last_activity_at' => null,
    ]);

    expect(Wallet::recentlyActive()->count())->toBe(3);

    expect(array_map(fn ($wallet) => $wallet->id, $active))
        ->toEqualCanonicalizing(Wallet::recentlyActive()->pluck('id')->toArray());
});

it('filters not recently active wallets', function () {
    $this->freezeTime();

    $active[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.active_threshold') - 1),
    ]);

    $active[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.active_threshold')),
    ]);

    $inactive[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.active_threshold') + 1),
    ]);

    $inactive[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.active_threshold') + 2),
    ]);

    $active[] = Wallet::factory()->create([
        'last_activity_at' => now(),
    ]);

    $inactive[] = Wallet::factory()->create([
        'last_activity_at' => null,
    ]);

    expect(Wallet::notRecentlyActive()->count())->toBe(3);

    expect(array_map(fn ($wallet) => $wallet->id, $inactive))
        ->toEqualCanonicalizing(Wallet::notRecentlyActive()->pluck('id')->toArray());
});

it('filters online wallets', function () {
    $this->freezeTime();

    $online[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.online_threshold') - 1),
    ]);

    $online[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.online_threshold')),
    ]);

    $inactive[] = Wallet::factory()->create([
        'last_activity_at' => now()->subSeconds(config('dashbrd.wallets.online_threshold') + 1),
    ]);

    $online[] = Wallet::factory()->create([
        'last_activity_at' => now(),
    ]);

    $inactive[] = Wallet::factory()->create([
        'last_activity_at' => null,
    ]);

    expect(Wallet::online()->count())->toBe(3);

    expect(array_map(fn ($wallet) => $wallet->id, $online))
        ->toEqualCanonicalizing(Wallet::online()->pluck('id')->toArray());
});

it('checks if wallet belongs to local testing address', function () {
    config(['dashbrd.testing_wallet' => null]);

    $wallet = Wallet::factory()->createOne();
    expect($wallet->isLocalTestingAddress())->toBeFalse();

    config(['dashbrd.testing_wallet' => $wallet->address]);

    expect($wallet->isLocalTestingAddress())->toBeTrue();
});

it('can find balance model for the token', function () {
    $wallet = Wallet::factory()->create();
    $token = Token::factory()->create();
    $anotherToken = Token::factory()->create();

    $balance = Balance::factory()->create([
        'wallet_id' => $wallet->id,
        'token_id' => $token->id,
    ]);

    expect($wallet->findBalance($token)->is($balance))->toBeTrue();
    expect($wallet->findBalance($anotherToken))->toBeNull();
});

it('can dispatch all indexing jobs for the wallet and the network', function () {
    Bus::fake();

    $wallet = Wallet::factory()->create([
        'onboarded_at' => null,
    ]);

    $network = Network::factory()->create();

    $wallet->dispatchIndexingJobs($network);

    Bus::assertBatched(function ($batch) use ($wallet) {
        /* @var \Illuminate\Queue\SerializableClosure $callback */
        [$callback] = $batch->finallyCallbacks();

        $callback->getClosure()->call($this);

        expect($wallet->fresh()->onboarded_at)->not->toBeNull();

        return $batch->jobs->count() > 0;
    });
});

it('gets the tokens_fetched_at date', function () {
    $wallet = Wallet::factory()->create([
        'extra_attributes' => [
            'tokens_fetched_at' => Carbon::now(),
        ],
    ]);

    expect($wallet->tokensFetchedAt())->toBeInstanceOf(Carbon::class);
});

it('gets the tokens_fetched_at if not set', function () {
    $wallet = Wallet::factory()->create();

    expect($wallet->tokensFetchedAt())->toBeNull();
});

it('gets the native_balances_fetched_at date', function () {
    $wallet = Wallet::factory()->create([
        'extra_attributes' => [
            'native_balances_fetched_at' => Carbon::now(),
        ],
    ]);

    expect($wallet->nativeBalancesFetchedAt())->toBeInstanceOf(Carbon::class);
});

it('gets the native_balances_fetched_at if not set', function () {
    $wallet = Wallet::factory()->create();

    expect($wallet->nativeBalancesFetchedAt())->toBeNull();
});

it('filters wallets that have been signed at least one time', function () {
    $signed = Wallet::factory()->create([
        'last_signed_at' => now(),
    ]);

    Wallet::factory()->create([
        'last_signed_at' => null,
    ]);

    $filtered = Wallet::hasBeenSigned()->get();

    expect($filtered->count())->toBe(1);

    expect($filtered->first()->id)->toBe($signed->id);
});

it('can determine whether wallet can refresh the collections', function () {
    expect((new Wallet([
        'is_refreshing_collections' => false,
        'refreshed_collections_at' => null,
    ]))->canRefreshCollections())->toBeTrue();

    expect((new Wallet([
        'is_refreshing_collections' => true,
        'refreshed_collections_at' => null,
    ]))->canRefreshCollections())->toBeFalse();

    expect((new Wallet([
        'is_refreshing_collections' => false,
        'refreshed_collections_at' => now()->subMinutes(10),
    ]))->canRefreshCollections())->toBeFalse();

    expect((new Wallet([
        'is_refreshing_collections' => false,
        'refreshed_collections_at' => now()->subMinutes(16),
    ]))->canRefreshCollections())->toBeTrue();
});
