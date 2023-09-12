<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use Filament\Infolists\Components\TextEntry;
use App\Filament\Resources\WalletResource\Pages\CreateWallet;
use App\Filament\Resources\WalletResource\Pages\EditWallet;
use App\Filament\Resources\WalletResource\Pages\ListWallets;
use App\Filament\Resources\WalletResource\Pages\ViewWallet;
use App\Models\Wallet;
use Filament\Forms\Form;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables\Actions\CreateAction;
use Filament\Tables\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class WalletResource extends Resource
{
    protected static ?string $model = Wallet::class;

    protected static ?string $navigationIcon = 'heroicon-o-wallet';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                TextEntry::make('address'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('address')
                            ->weight('medium')
                            ->color('primary')
                            ->label('Address')
                            ->default('Unknown')
                            ->formatStateUsing(fn ($state) => empty($state) ? 'None' : $state)
                            ->url(fn (?Wallet $wallet) => $wallet !== null ? sprintf('https://blockscan.com/address/%s', $wallet->address) : null)
                            ->openUrlInNewTab()
                            ->icon('heroicon-o-arrow-top-right-on-square')
                            ->iconPosition('after')
                            ->searchable(),

                TextColumn::make('details.domain')
                            ->weight(fn ($state) => $state ? 'medium' : null)
                            ->color(fn ($state) => $state ? 'primary' : null)
                            ->label('ENS domain')
                            ->formatStateUsing(fn ($state) => empty($state) ? 'None' : $state)
                            ->url(fn (?Wallet $wallet) => $wallet?->details?->domain
                                        ? sprintf('https://app.ens.domains/%s', $wallet->details->domain)
                                        : null
                            )
                            ->openUrlInNewTab()
                            ->icon(fn ($state) => $state ? 'heroicon-o-arrow-top-right-on-square' : null)
                            ->iconPosition('after')
                            ->searchable(),

                TextColumn::make('created_at')
                            ->label('Date Joined')
                            ->dateTime()
                            ->icon('heroicon-m-calendar')
                            ->sortable(),

                TextColumn::make('last_activity_at')
                            ->label('Last Activity')
                            ->since()
                            ->icon('heroicon-m-calendar')
                            ->sortable(),
            ])
            ->filters([
                //
            ])
            ->recordUrl(fn (Wallet $wallet) => WalletResource::getUrl('view', ['record' => $wallet]))
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
            'index' => ListWallets::route('/'),
            'view' => ViewWallet::route('/{record}'),
            'create' => CreateWallet::route('/create'),
            'edit' => EditWallet::route('/{record}/edit'),
        ];
    }

    public static function shouldSkipAuthorization(): bool
    {
        return app()->isLocal();
    }
}
