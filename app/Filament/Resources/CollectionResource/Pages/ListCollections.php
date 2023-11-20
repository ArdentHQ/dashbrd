<?php

namespace App\Filament\Resources\CollectionResource\Pages;

use Filament\Actions\CreateAction;
use App\Filament\Resources\CollectionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListCollections extends ListRecords
{
    protected static string $resource = CollectionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
