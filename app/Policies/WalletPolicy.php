<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\Wallet;

final class WalletPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user:viewAny', 'admin');
    }

    public function view(User $user, Wallet $wallet): bool
    {
        return $user->hasPermissionTo('user:view', 'admin');
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Wallet $wallet): bool
    {
        if ($user->wallets->contains($wallet)) {
            return true;
        }

        return false;
    }

    public function delete(User $user, Wallet $wallet): bool
    {
        return false;
    }

    public function restore(User $user, Wallet $wallet): bool
    {
        return false;
    }

    public function forceDelete(User $user, Wallet $wallet): bool
    {
        return false;
    }
}
