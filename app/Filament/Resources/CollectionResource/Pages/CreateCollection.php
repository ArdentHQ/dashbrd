<?php

declare(strict_types=1);

namespace App\Filament\Resources\CollectionResource\Pages;

use App\Filament\Resources\CollectionResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCollection extends CreateRecord
{
    protected static string $resource = CollectionResource::class;
}
