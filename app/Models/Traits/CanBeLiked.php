<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Cache;

trait CanBeLiked
{
    abstract protected function likesTable(): string;

    /**
     * @return BelongsToMany<User>
     */
    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, $this->likesTable());
    }

    public function addLike(User $user): self
    {
        if (! $this->isLikedBy($user)) {
            $this->likes()->attach($user);

            $this->clearLikeCountCache();
        }

        return $this;
    }

    public function removeLike(User $user): self
    {
        if ($this->isLikedBy($user)) {
            $this->likes()->detach($user);

            $this->clearLikeCountCache();
        }

        return $this;
    }

    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    public function getLikeCountAttribute(): int
    {
        return intval(
            Cache::tags('likes')
                ->rememberForever($this->cacheKey(), fn () => $this->likes->count())
        );
    }

    private function clearLikeCountCache(): void
    {
        Cache::tags('likes')->forget($this->cacheKey());
    }

    private function cacheKey(): string
    {
        return $this->likesTable().'.count.'.$this->id;
    }
}
