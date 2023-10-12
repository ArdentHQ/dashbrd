<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\ArticleCategoryEnum;
use App\Filament\Resources\ArticleResource\Pages\CreateArticle;
use App\Filament\Resources\ArticleResource\Pages\EditArticle;
use App\Filament\Resources\ArticleResource\Pages\ListArticles;
use App\Filament\Resources\ArticleResource\Pages\ViewArticle;
use App\Models\Article;
use App\Models\Collection;
use App\Models\User;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\CreateAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Str;

class ArticleResource extends Resource
{
    protected static ?string $model = Article::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    public static function form(Form $form): Form
    {
        /** @var Article|null */
        $article = $form->getRecord();

        return $form
            ->schema([
                TextInput::make('title')->required()->columnSpan('full'),

                Select::make('collections')
                    ->multiple()
                    ->afterStateHydrated(static function (Select $component, $state) use ($article): void {
                        if ($article === null) {
                            return;
                        }

                        $component->state($article->collections()->pluck('id')->toArray());
                    })
                    ->searchable()
                    ->getSearchResultsUsing(fn (string $search) => Collection::where('name', 'ilike', "%{$search}%")->limit(10)->pluck('name', 'id')->toArray())
                    ->getOptionLabelsUsing(fn (Select $component, array $values) => Collection::whereIn('id', $values)
                        ->orderByRaw('position(id::text in ?)', [implode(',', $values)])
                        ->pluck('name', 'id')->toArray()
                    )
                    ->required()
                    ->minItems(1)
                    ->maxItems(8),

                Select::make('category')
                    ->options([
                        ArticleCategoryEnum::News->value => Str::title(ArticleCategoryEnum::News->value),
                    ])
                    ->default(ArticleCategoryEnum::News->value)
                    ->required(),
                Textarea::make('meta_description')->nullable()->autosize()->columnSpan('full'),
                Textarea::make('content')->required()->autosize()->columnSpan('full'),
                Select::make('user_id')
                    ->relationship(
                        name: 'user',
                        modifyQueryUsing: fn ($query) => $query->managers()->orderBy('username')->orderBy('email')
                    )
                    ->getOptionLabelFromRecordUsing(fn (User $user) => $user->username ?? $user->email ?? 'ID '.$user->id)
                    ->required(),
                DatePicker::make('published_at')->nullable(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->label('Title')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('category')
                    ->label('Category')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('published_at')
                        ->label('Date Published')
                        ->date()
                        ->sortable(),

                TextColumn::make('created_at')
                        ->label('Date Created')
                        ->dateTime()
                        ->sortable(),

            ])
            ->filters([
                //
            ])
            ->recordUrl(fn (Article $article) => ArticleResource::getUrl('view', ['record' => $article]))
            ->actions([
                ViewAction::make(),
            ])
            ->emptyStateActions([
                CreateAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListArticles::route('/'),
            'create' => CreateArticle::route('/create'),
            'view' => ViewArticle::route('/{record}'),
            'edit' => EditArticle::route('/{record}/edit'),
        ];
    }

    /**
     * @return Builder<Article>
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }

    public static function shouldSkipAuthorization(): bool
    {
        return app()->isLocal();
    }
}
