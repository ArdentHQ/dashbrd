<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\GalleryResource\Pages\ListGalleries;
use App\Models\Gallery;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class GalleryResource extends Resource
{
    protected static ?string $model = Gallery::class;

    protected static ?string $navigationIcon = 'heroicon-o-photo';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('cover_image')
                            ->getStateUsing(fn (Gallery $gallery) => $gallery->cover_image ? str_replace('/storage', '', $gallery->cover_image) : null)
                            ->disk('public')
                            ->size(40)
                            ->url(fn (Gallery $gallery) => $gallery->cover_image)
                            ->openUrlInNewTab(),

                TextColumn::make('name')
                            ->weight('medium')
                            ->color('primary')
                            ->label('Name')
                            ->default('Unknown')
                            ->url(fn (Gallery $gallery) => route('galleries.view', $gallery))
                            ->icon(fn ($state) => $state ? 'heroicon-o-arrow-top-right-on-square' : null)
                            ->iconPosition('after')
                            ->openUrlInNewTab()
                            ->sortable(),

                TextColumn::make('created_at')
                            ->label('Date Created')
                            ->dateTime()
                            ->icon('heroicon-m-calendar')
                            ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                ActionGroup::make([
                    Action::make('unresolve')
                            ->label('Remove cover image')
                            ->requiresConfirmation()
                            ->action(fn (Gallery $gallery) => $gallery->update([
                                'cover_image' => null,
                            ]))
                            ->icon('heroicon-o-photo')
                            ->modalHeading('Remove cover image')
                            ->modalDescription('Are you sure you want to remove the cover image for this gallery?')
                            ->modalSubmitActionLabel('Yes, do it')
                            ->modalIcon('heroicon-o-photo')
                            ->modalWidth('sm'),

                    Tables\Actions\DeleteAction::make(),
                ]),
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
            'index' => ListGalleries::route('/'),
        ];
    }
}
