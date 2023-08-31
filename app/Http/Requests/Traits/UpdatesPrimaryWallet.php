<?php

declare(strict_types=1);

namespace App\Http\Requests\Traits;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Validation\ValidationException;

trait UpdatesPrimaryWallet
{
    public function updatePrimaryWallet(): void
    {
        /** @var User */
        $user = $this->user();

        $wallet = Wallet::findByAddress($this->address);

        if ($wallet === null) {
            throw ValidationException::withMessages([
                'address' => __('auth.failed'),
            ]);
        }

        $user->wallet()->associate($wallet)->save();
    }
}
