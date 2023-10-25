<?php

declare(strict_types=1);

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Filament\Resources\UserResource\Pages\Traits\HandlePermissions;
use App\Filament\Resources\UserResource\Pages\Traits\HandleRole;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditUser extends EditRecord
{
    use HandlePermissions, HandleRole;

    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        /** @var string $role */
        $role = $data['role'];
        unset($data['role']);

        /** @var mixed $permissions */
        $permissions = $data['permissions'] ?? [];
        unset($data['permissions']);

        $this->handleRole($record, $role);

        $this->handlePermissions($record, $permissions);

        return parent::handleRecordUpdate($record, $data);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
