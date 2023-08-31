<?php

declare(strict_types=1);

use App\Http\Middleware\EnsureOnboarded;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

it('redirects to onboarding page on GET requests if user has not onboarded', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'onboarded_at' => null,
    ]);

    $user->wallet()->associate($wallet);

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new EnsureOnboarded();

    $response = $middleware->handle($request, fn () => response('Hello World'));

    expect($response)->toBeInstanceOf(RedirectResponse::class);
});

it('aborts on non-GET requests if user has not onboarded', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'onboarded_at' => null,
    ]);

    $user->wallet()->associate($wallet);

    $request = request()->setUserResolver(fn () => $user);

    $request->setMethod('POST');

    $middleware = new EnsureOnboarded();

    $middleware->handle($request, fn () => response('Hello World'));
})->throws(HttpException::class);

it('lets through if user is not authenticated', function () {
    $request = request();

    $middleware = new EnsureOnboarded();

    $response = $middleware->handle($request, fn () => response('Hello World'));

    expect($response)->toBeInstanceOf(Response::class);
});

it('lets the user through if user has onboarded', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'onboarded_at' => now(),
    ]);

    $user->wallet()->associate($wallet);

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new EnsureOnboarded();

    $called = false;

    $middleware->handle($request, function () use (&$called) {
        $called = true;

        return response('Hello World');
    });

    expect($called)->toBeTrue();
});
