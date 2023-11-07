<?php

declare(strict_types=1);

namespace App\Filament\Resources\UserResource\Pages\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

trait HandlePermissions
{
    /**
     * @param  array<string>|Collection<int, string>  $permissions
     */
    private function handlePermissions(Model $model, Collection|array $permissions): void
    {
        /** @var User */
        $user = auth()->user();

        if (! $user->can('assignPermissions', User::class)) {
            return;
        }

        /** @var User $model */
        $model->syncPermissions($permissions);

        $model->forgetCachedPermissions();
    }
}
