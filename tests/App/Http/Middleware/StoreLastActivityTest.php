<?php

declare(strict_types=1);

use App\Events\WalletBecameActive;
use App\Http\Middleware\StoreLastActivity;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;

it('stores the last_activity_at', function () {
    $user = User::factory()->create();

    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);

    expect($user->wallet->last_activity_at)->toBeNull();

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new StoreLastActivity();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });

    expect($user->wallet->fresh()->last_activity_at)->toBeInstanceOf(Carbon::class);
});

it('stores the last_activity_at without adjusting updated_at', function () {
    $this->freezeTime();

    $user = User::factory()->create();

    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);

    expect($user->wallet->last_activity_at)->toBeNull();

    $updatedAt = $user->wallet->updated_at;

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new StoreLastActivity();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });

    expect($user->wallet->fresh()->last_activity_at)->toBeInstanceOf(Carbon::class);
    expect($user->wallet->updated_at)->toEqual($updatedAt);
});

it('does not store the last_activity_at if cache set', function () {
    $user = User::factory()->create();

    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);

    Cache::shouldReceive('missing')->once()->with('recently_stored_last_activity-'.$wallet->id)->andReturn(false);

    expect($user->wallet->last_activity_at)->toBeNull();

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new StoreLastActivity();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });

    expect($user->wallet->fresh()->last_activity_at)->toBeNull();
});

it('does not store the last_activity_at if no user', function () {
    Cache::shouldReceive('missing')->never();

    $request = request();

    $middleware = new StoreLastActivity();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });
});

it('triggers a WalletBecameActive event if wallet has no activity', function () {
    Event::fake();

    $user = User::factory()->create();

    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);

    expect($user->wallet->last_activity_at)->toBeNull();

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new StoreLastActivity();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });

    Event::assertDispatched(WalletBecameActive::class, function ($event) use ($wallet) {
        return $event->wallet->id === $wallet->id;
    });
});

it('triggers a WalletBecameActive event if wallet has no recent activity', function () {
    Event::fake();

    $user = User::factory()->create();

    $wallet = Wallet::factory()->create([
        'last_activity_at' => Carbon::now()->subYear(),
    ]);

    $user->wallet()->associate($wallet);

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new StoreLastActivity();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });

    Event::assertDispatched(WalletBecameActive::class, function ($event) use ($wallet) {
        return $event->wallet->id === $wallet->id;
    });
});

it('does not triggers a WalletBecameActive event if wallet has recent activity', function () {
    Event::fake();

    $user = User::factory()->create();

    $wallet = Wallet::factory()->create([
        'last_activity_at' => Carbon::now(),
    ]);

    $user->wallet()->associate($wallet);

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new StoreLastActivity();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });

    Event::assertNotDispatched(WalletBecameActive::class);
});

it('sends jobs to priority queue when wallet was never active before', function () {
    Bus::fake();

    $this->freezeTime();

    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();
    $user->wallet()->associate($wallet);

    expect($user->wallet->last_activity_at)->toBeNull();

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new StoreLastActivity();

    Bus::assertNothingBatched();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });

    Bus::assertBatched(fn ($batch) => $batch->queue() === 'priority');
});

it('sends jobs to non-priority queue when wallet was active before', function () {
    Bus::fake();

    $this->freezeTime();

    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();
    $user->wallet()->associate($wallet);

    expect($user->wallet->last_activity_at)->toBeNull();

    // mark as active before at some point
    $wallet->update(['last_activity_at' => Carbon::now()->subDays(2)]);

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new StoreLastActivity();

    Bus::assertNothingBatched();

    $middleware->handle($request, function () {
        return response()->json(['message' => 'ok']);
    });

    Bus::assertBatched(fn ($batch) => $batch->queue() !== 'priority');
});
