<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\CollectionResource\Pages\EditCollection;
use App\Filament\Resources\CollectionResource\Pages\ListCollections;
use App\Filament\Resources\CollectionResource\Pages\ViewCollection;
use App\Models\Collection;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class CollectionResource extends Resource
{
    protected static ?string $model = Collection::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Select::make('is_featured')
                    ->label('Is featured?')
                    ->options([
                        0 => 'No',
                        1 => 'Yes',
                    ])
                    ->default(0)
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                            ->label('Image')
                            ->getStateUsing(fn (Collection $collection) => $collection->image() ?? null)
                            ->size(40)
                            ->url(fn (Collection $collection) => $collection->image())
                            ->openUrlInNewTab(),

                TextColumn::make('name')
                            ->weight('medium')
                            ->color('primary')
                            ->label('Name')
                            ->searchable()
                            ->default('Unknown')
                            ->url(fn (Collection $collection) => route('collections.view', $collection))
                            ->openUrlInNewTab()
                            ->sortable(),

                TextColumn::make('nfts_count')
                            ->label('Number of NFTs')
                            ->counts('nfts')
                            ->default(0),

                TextColumn::make('address')
                            ->label('Address')
                            ->searchable()
                            ->url(fn (Collection $collection) => $collection->website())
                            ->default('Unknown'),

                IconColumn::make('is_featured')
                            ->label('Featured')
                            ->boolean()
                            ->sortable(),
            ])
            ->filters([
                Filter::make('is_featured')
                    ->label('Featured')
                    ->query(fn (Builder $query): Builder => $query->where('is_featured', true)),
            ])
            ->actions([
                ActionGroup::make([
                    Action::make('updateIsFeatured')
                        ->action(function (Collection $collection) {
                            if ($collection->nfts()->count() === 0 && ! $collection->is_featured) {
                                Notification::make()
                                            ->title('Collections with no NFTs cannot be marked as featured.')
                                            ->danger()
                                            ->send();
                            } elseif (! $collection->is_featured && Collection::featured()->count() >= 4) {
                                Notification::make()
                                            ->title('There are already 4 collections marked as featured. Please remove one before selecting a new one.')
                                            ->warning()
                                            ->send();
                            } else {
                                $collection->update([
                                    'is_featured' => ! $collection->is_featured,
                                ]);

                                Cache::forget('featured-collections');
                            }
                        })
                        ->label(fn (Collection $collection) => $collection->is_featured ? 'Unmark as featured' : 'Mark as featured')
                        ->icon('heroicon-s-star'),
                ]),
            ])
            ->defaultSort('name', 'asc');
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
            'index' => ListCollections::route('/'),
            'view' => ViewCollection::route('/{record}'),
            'edit' => EditCollection::route('/{record}/edit'),
        ];
    }
}
