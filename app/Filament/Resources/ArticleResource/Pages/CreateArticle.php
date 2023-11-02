<?php

declare(strict_types=1);

namespace App\Filament\Resources\ArticleResource\Pages;

use App\Filament\Resources\ArticleResource;
use App\Models\Article;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateArticle extends CreateRecord
{
    protected static string $resource = ArticleResource::class;

    /**
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordCreation(array $data): Model
    {
        /**
         * @var array<string> $collections
         */
        $collections = $data['collections'];
        unset($data['collections']);

        /** @var Article */
        $record = parent::handleRecordCreation($data);

        $record->collections()->attach($collections, ['order_index' => 1]);

        return $record;
    }
}
