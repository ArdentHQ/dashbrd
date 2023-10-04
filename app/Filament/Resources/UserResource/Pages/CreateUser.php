<?php

declare(strict_types=1);

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Filament\Resources\UserResource\Pages\Traits\HandlePermissions;
use App\Filament\Resources\UserResource\Pages\Traits\HandleRole;
use App\Models\User;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class CreateUser extends CreateRecord
{
    use HandlePermissions, HandleRole;

    protected static string $resource = UserResource::class;

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordCreation(array $data): Model
    {
        /** @var string $role */
        $role = $data['role'];
        unset($data['role']);

        /** @var mixed $permissions */
        $permissions = Arr::get($data, 'permissions', []);
        unset($data['permissions']);

        /** @var User */
        $model = parent::handleRecordCreation($data);

        $this->handleRole($model, $role);

        $this->handlePermissions($model, $permissions);

        return $model;
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
