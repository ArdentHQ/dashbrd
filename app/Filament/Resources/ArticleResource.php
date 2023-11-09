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
use Carbon\Carbon;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\CreateAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
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
                TextInput::make('title')->required()->columnSpan('full')
                    ->rules(['max:100'])
                    ->maxLength(100),

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

                Textarea::make('meta_description')->nullable()->autosize()->columnSpan('full')->maxLength(160)->helperText('Max 160 characters'),

                SpatieMediaLibraryFileUpload::make('cover')
                    ->collection('cover')
                    ->columnSpan('full')
                    ->image()
                    ->imageEditor()
                    ->imageCropAspectRatio('16:9')
                    ->rules(['max:5120', 'required'])
                    ->required(),

                MarkdownEditor::make('content')
                    ->columnSpan('full')
                    ->fileAttachmentsDisk('public')
                    ->fileAttachmentsDirectory('attachments')
                    ->fileAttachmentsVisibility('public')
                    ->required(),

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
                    ->searchable()
                    ->limit(60),

                TextColumn::make('user.username')
                    ->label('Author')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('published_at')
                        ->label('Date Published')
                        ->formatStateUsing(function (string $state): string {
                            $date = Carbon::parse($state);

                            if ($date > Carbon::now()) {
                                return $date->toFormattedDateString().' ⌛';
                            }

                            return $date->toFormattedDateString();
                        })
                        ->sortable()
                        ->placeholder('Draft'),

                SpatieMediaLibraryImageColumn::make('cover')->collection('cover')->conversion('small@2x'),
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
            ])
            ->defaultSort('published_at', 'desc');
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
