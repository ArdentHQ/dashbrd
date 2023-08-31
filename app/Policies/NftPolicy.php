<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Nft;
use App\Models\User;

final class NftPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user:viewAny', 'admin');
    }

    public function view(User $user, Nft $nft): bool
    {
        return $user->hasPermissionTo('user:view', 'admin');
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Nft $nft): bool
    {
        return false;
    }

    public function delete(User $user, Nft $nft): bool
    {
        return false;
    }

    public function restore(User $user, Nft $nft): bool
    {
        return false;
    }

    public function forceDelete(User $user, Nft $nft): bool
    {
        return false;
    }
}
