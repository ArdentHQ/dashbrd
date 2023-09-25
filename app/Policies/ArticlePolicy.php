<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

final class ArticlePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('article:viewAny', 'admin');
    }

    public function view(User $user, Article $article): bool
    {
        // If users can view any, can view single article
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('article:create', 'admin');
    }

    public function update(User $user, Article $article): bool
    {
        if ($user->hasPermissionTo('article:updateAny', 'admin')) {
            return true;
        }

        // If users can create, they can update their own
        return $this->create($user) && ($user->is($article->user));
    }

    public function delete(User $user, Article $article): bool
    {
        if ($user->hasPermissionTo('article:deleteAny', 'admin')) {
            return true;
        }

        // If users can create, they can delete their own
        return $this->create($user) && ($user->is($article->user));
    }

    public function restore(User $user, Article $article): bool
    {
        return $user->hasPermissionTo('article:restore', 'admin');
    }

    public function forceDelete(User $user, Article $article): bool
    {
        return $user->hasPermissionTo('article:forceDelete', 'admin');
    }
}
