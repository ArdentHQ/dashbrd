<?php

declare(strict_types=1);

namespace App\Support\Facades;

use App\Support\Signature as Base;
use Illuminate\Support\Facades\Facade;

/**
 * @method static string nonce()
 * @method static string buildSignMessage(string $nonce)
 * @method static bool verify(string $signature, string $message, string $address)
 * @method static void storeSessionNonce(int $chainId, string $nonce)
 * @method static void forgetSessionNonce(int $chainId)
 * @method static void setWalletIsNotSigned(int $walletId)
 * @method static void setWalletIsSigned(int $walletId)
 * @method static bool walletIsSigned(int $walletId)
 * @method static ?string getSessionNonce(int $chainId)
 *
 * @see \App\Support\Signature
 */
class Signature extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return Base::class;
    }
}
