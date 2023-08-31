<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Gallery;
use App\Models\User;

final class GalleryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('user:viewAny', 'admin');
    }

    public function view(User $user, Gallery $gallery): bool
    {
        return $user->hasPermissionTo('user:view', 'admin');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('user:view', 'admin');
    }

    public function update(User $user, Gallery $gallery): bool
    {
        return $gallery->user_id === $user->id
            || $user->hasPermissionTo('user:view', 'admin');
    }

    public function delete(User $user, Gallery $gallery): bool
    {
        return $gallery->user_id === $user->id
            || $user->hasPermissionTo('user:view', 'admin');
    }
}
