<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-user';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('email')->required()->columnSpan('full')->email(),
                TextInput::make('username')->columnSpan('full'),
                TextInput::make('password')->columnSpan('full')->password()
                    ->dehydrateStateUsing(fn (string $state): string => Hash::make($state))
                    ->dehydrated(fn (?string $state): bool => filled($state))
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->autocomplete('new-password'),
                TextInput::make('display_name')->columnSpan('full'),
                // Select::make('category')
                //     ->options([
                //         ArticleCategoryEnum::News->value => Str::title(ArticleCategoryEnum::News->value),
                //     ])
                //     ->default(ArticleCategoryEnum::News->value)
                //     ->required(),
                // Textarea::make('meta_description')->nullable()->autosize()->columnSpan('full'),
                // Textarea::make('content')->required()->autosize()->columnSpan('full'),
                // Select::make('user_id')
                //     ->relationship(
                //         name: 'user',
                //         modifyQueryUsing: fn ($query) => $query->managers()->orderBy('username')->orderBy('email')
                //     )
                //     ->getOptionLabelFromRecordUsing(fn (User $user) => $user->username ?? $user->email ?? 'ID '.$user->id)
                //     ->required(),
                // DatePicker::make('published_at')->nullable(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('username')
                    ->label('Username')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email')
                    ->sortable()
                    ->searchable(),
                TextColumn::make('display_name')
                    ->label('Display Name')
                    ->sortable()
                    ->searchable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    /**
     * @return Builder<User>
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->managers();
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
