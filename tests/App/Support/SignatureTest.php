<?php

declare(strict_types=1);

use App\Models\Wallet;
use App\Support\Signature;
use Illuminate\Support\Facades\Session;

it('should generate a signature', function () {
    expect(Signature::buildSignMessage('test-nonce'))->toBe(trans('auth.wallet.sign_message', ['nonce' => 'test-nonce']));
});

it('should verify a signature', function () {
    $message = trans('auth.wallet.sign_message', ['nonce' => 'THcZ9JRnEOiNzmzp']);
    $signature = '0x5b6d7ddc4d964037643bae2c394e819547ff5a34f51020bd41b448092f96b5c164ea93cfd604835c1ca8496ab5a3a42b0b45f1e3f49043dca3730071ec477cbf1c';
    $address = '0x85D813ba28DbA855932B8e32274e449f7809fc56';

    expect(Signature::verify($signature, $message, $address))->toBeTrue();
});

it('should not verify a signature if it is invalid', function () {
    $message = trans('auth.wallet.sign_message', ['nonce' => 'THcZ9JRnEOiNzmzp']);
    $signature = 'invalid signature';
    $address = '0x85D813ba28DbA855932B8e32274e449f7809fc56';

    $verified = false;

    try {
        $verified = Signature::verify($signature, $message, $address);
    } catch (Throwable) {
        //
    }

    expect($verified)->toBeFalse();
});

it('should not verify if signature is wrong', function () {
    $message = trans('auth.wallet.sign_message', ['nonce' => 'THcZ9JRnEOiNzmzp']);
    $signature = '0x5b6d7ddc4d964037643bae2c394e819547ff5a34f51020bd41b448092f96b5c164ea93cfd604835c1ca8496ab5a3a42b0b45f1e3f49043dca3730071ec477cbf1b';
    $address = '0x85D813ba28DbA855932B8e32274e449f7809fc56';

    expect(Signature::verify($signature, $message, $address))->toBeFalse();
});

it('should verify a ledger signature', function ($address, $signature) {
    expect(Signature::verify($signature, trans('auth.wallet.sign_message', ['nonce' => 'THcZ9JRnEOiNzmzp']), $address))->toBeTrue();
})->with([
    // Ledger X
    [
        '0x85D813ba28DbA855932B8e32274e449f7809fc56',
        '0x5b6d7ddc4d964037643bae2c394e819547ff5a34f51020bd41b448092f96b5c164ea93cfd604835c1ca8496ab5a3a42b0b45f1e3f49043dca3730071ec477cbf1c',
    ],
    // Ledger S
    [
        '0xCe7Bb8f32490F9d1B4D321A5D5EB58b9DAAAF43E',
        '0x01f46525cd517718101515d2d2a03de382b1aa7ff913f4c6d53c167c3493505f100de669395bbc0ba92db8658035aa08b1d224a9c228ff808106dde9f8f64c3900',
    ],
]);

it('should allow storing the nonce in the session', function () {
    $chainId = 1;

    expect(Session::get('sign-message.nonce.'.$chainId))->toBeNull();

    Signature::storeSessionNonce(1, 'nonce');

    expect(Session::get('sign-message.nonce.'.$chainId))->toBe('nonce');
});

it('should allow retrieving the nonce from the session', function () {
    $chainId = 1;

    expect(Signature::getSessionNonce($chainId))->toBeNull();

    Signature::storeSessionNonce($chainId, 'nonce');

    expect(Signature::getSessionNonce($chainId))->toBe('nonce');
});

it('should allow forgetting the nonce that is stored in the session', function () {
    $chainId = 1;

    expect(Session::get('sign-message.nonce.'.$chainId))->toBeNull();

    Signature::storeSessionNonce($chainId, 'nonce');

    expect(Session::get('sign-message.nonce.'.$chainId))->toBe('nonce');

    Signature::forgetSessionNonce($chainId);

    expect(Session::get('sign-message.nonce.'.$chainId))->toBeNull();
});

it('should generate a nonce', function () {
    expect(Signature::nonce())->toBeString();
});

it('should set wallet as signed and not signed and set last_signed_at', function () {
    $wallet = Wallet::factory()->create();
    $otherWallet = Wallet::factory()->create();

    Signature::setWalletIsSigned($wallet->id);

    expect($wallet->fresh()->extra_attributes->get('last_signed_at'))->not->toBeNull();
    expect($otherWallet->fresh()->extra_attributes->get('last_signed_at'))->toBeNull();

    expect(Session::get('wallet-is-signed.'.$wallet->id))->toBeTrue();

    expect(Signature::walletIsSigned($wallet->id))->toBeTrue();

    Signature::setWalletIsNotSigned($wallet->id);

    expect(Session::get('wallet-is-signed.'.$wallet->id))->toBeNull();

    expect(Signature::walletIsSigned($wallet->id))->toBeFalse();
});
