<?php

declare(strict_types=1);

namespace App\Filament\Resources\ArticleResource\Pages;

use App\Filament\Resources\ArticleResource;
use App\Models\Article;
use Filament\Actions\DeleteAction;
use Filament\Actions\ForceDeleteAction;
use Filament\Actions\RestoreAction;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditArticle extends EditRecord
{
    protected static string $resource = ArticleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
            ForceDeleteAction::make(),
            RestoreAction::make(),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        /**
         * @var array<string> $collections
         */
        $collections = $data['collections'];
        unset($data['collections']);

        /**
         * @var Article $record
         */
        $record->collections()->detach();
        $record->collections()->attach($collections, ['order_index' => 1]);

        return parent::handleRecordUpdate($record, $data);
    }
}
