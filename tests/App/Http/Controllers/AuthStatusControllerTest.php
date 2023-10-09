<?php

declare(strict_types=1);

use App\Support\Facades\Signature;

it('check authenticated status for guest', function () {

    $response = $this->getJson(route('auth-status'));

    expect($response->json())->toEqual([
        'authenticated' => false,
        'signed' => false,
    ]);
});

it('check authenticated status for authenticated but not signed', function () {
    $user = createUser();

    $response = $this->actingAs($user)->getJson(route('auth-status'));

    expect($response->json())->toEqual([
        'authenticated' => true,
        'signed' => false,
    ]);
});

it('check authenticated status for authenticated and signed', function () {
    $user = createUser();

    Signature::setWalletIsSigned($user->wallet->id);

    $response = $this->actingAs($user)->getJson(route('auth-status'));

    expect($response->json())->toEqual([
        'authenticated' => true,
        'signed' => true,
    ]);
});
