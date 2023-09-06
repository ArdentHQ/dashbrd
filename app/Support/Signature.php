<?php

declare(strict_types=1);

namespace App\Support;

use Elliptic\EC;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use kornrunner\Keccak;

class Signature
{
    public static function nonce(): string
    {
        return Str::random();
    }

    public static function buildSignMessage(string $nonce): string
    {
        return trans('auth.wallet.sign_message', ['nonce' => $nonce]);
    }

    public static function storeSessionNonce(int $chainId, string $nonce): void
    {
        Session::put('sign-message.nonce.'.$chainId, $nonce);
    }

    public static function getSessionNonce(int $chainId): ?string
    {
        return Session::get('sign-message.nonce.'.$chainId);
    }

    public static function forgetSessionNonce(int $chainId): void
    {
        Session::forget('sign-message.nonce.'.$chainId);
    }

    public static function setIsSigned(int $chainId): void
    {
        Session::put('user-is-signed.'.$chainId, true);
    }

    public static function setIsNotSigned(int $chainId): void
    {
        Session::forget('user-is-signed.'.$chainId);
    }

    // See https://github.com/ArdentHQ/msq.io/pull/511 for further details
    public static function verify(string $signature, string $message, string $address): bool
    {
        /** @var string $signatureHex */
        $signatureHex = hex2bin(substr($signature, 130, 2));

        $hash = Keccak::hash(sprintf("\x19Ethereum Signed Message:\n%s%s", strlen($message), $message), 256);
        $sign = ['r' => substr($signature, 2, 64), 's' => substr($signature, 66, 64)];
        $recid = ord($signatureHex);

        // This is needed for ledger interaction, see https://github.com/ArdentHQ/msq.io/pull/511#discussion_r994884941
        if ($recid === 0) {
            $recid = 27;
        } elseif ($recid === 1) {
            $recid = 28; // @codeCoverageIgnore
        }

        $recid -= 27;

        $pubkey = (new EC('secp256k1'))->recoverPubKey($hash, $sign, $recid);

        /** @var string $hashHex */
        $hashHex = hex2bin($pubkey->encode('hex'));

        return hash_equals(
            (string) Str::of($address)->after('0x')->lower(),
            substr(Keccak::hash(substr($hashHex, 1), 256), 24)
        );
    }
}
