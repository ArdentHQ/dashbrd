<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\CollectionResource\Pages\EditCollection;
use App\Filament\Resources\CollectionResource\Pages\ListCollections;
use App\Filament\Resources\CollectionResource\Pages\ViewCollection;
use App\Models\Collection;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

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

                TextColumn::make('is_featured')
                            ->label('Currently Featured')
                            ->getStateUsing(fn (Collection $collection) => $collection->is_featured ? 'Yes' : 'No')
                            ->sortable(),
            ])
            ->filters([
                Filter::make('is_featured')
                    ->label('Currently Featured')
                    ->query(fn (Builder $query): Builder => $query->where('is_featured', true)),
            ])
            ->actions([
                ActionGroup::make([
                    Action::make('updateIsFeatured')
                        ->action(function (Collection $collection) {
                            $collection->update([
                                'is_featured' => ! $collection->is_featured,
                            ]);
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
