<?php

namespace App\Filament\Resources\CollectionResource\Pages;

use Filament\Actions\EditAction;
use App\Filament\Resources\CollectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewCollection extends ViewRecord
{
    protected static string $resource = CollectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
