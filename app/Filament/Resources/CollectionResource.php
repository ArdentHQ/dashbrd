<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CollectionResource\Pages;
use App\Models\Collection;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

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

                TextColumn::make('nft_count')
                            ->label('Nft count (indexed)')
                            ->getStateUsing(fn (Collection $collection) => $collection->nfts()->count())
                            ->default(0),

                TextColumn::make('address')
                            ->label('Contract address')
                            ->searchable()
                            ->default('Unknown'),

                TextColumn::make('is_featured')
                            ->label('Is featured?')
                            ->getStateUsing(fn (Collection $collection) => $collection->is_featured ? 'Yes' : 'No'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->defaultSort('name', 'asc');;
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
            'index' => Pages\ListCollections::route('/'),
            'view' => Pages\ViewCollection::route('/{record}'),
            'edit' => Pages\EditCollection::route('/{record}/edit'),
        ];
    }
}
