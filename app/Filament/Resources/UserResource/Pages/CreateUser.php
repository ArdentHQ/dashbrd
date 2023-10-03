<?php

declare(strict_types=1);

namespace App\Filament\Resources\UserResource\Pages;

use App\Enums\Role;
use App\Filament\Resources\UserResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordCreation(array $data): Model
    {
        $role = $data['role'];

        unset($data['role']);

        $model = parent::handleRecordCreation($data);

        $validRoles = [
            Role::Editor->value,
        ];

        /** @var User */
        $user = auth()->user();

        if ($user->hasRole(Role::Admin->value)) {
            $validRoles[] = Role::Admin->value;
        } elseif ($user->hasRole(Role::Superadmin->value)) {
            $validRoles[] = Role::Admin->value;
            $validRoles[] = Role::Superadmin->value;
        }

        if (in_array($role, $validRoles)) {
            $model->syncRoles([$role]);
        }

        return $model;
    }
}
