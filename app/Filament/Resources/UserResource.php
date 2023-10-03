<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\Role;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
                Select::make('role')
                    ->options(function () {
                        $options = [
                            Role::Editor->value => Str::title(Role::Editor->value),
                        ];

                        /** @var User */
                        $user = auth()->user();

                        if ($user->hasRole(Role::Admin->value)) {
                            $options[Role::Admin->value] = Str::title(Role::Admin->value);
                        } elseif ($user->hasRole(Role::Superadmin->value)) {
                            $options[Role::Admin->value] = Str::title(Role::Admin->value);
                            $options[Role::Superadmin->value] = Str::title(Role::Superadmin->value);
                        }

                        return $options;
                    })
                    ->default(Role::Editor->value)
                    ->required(),

                SpatieMediaLibraryFileUpload::make('avatar')
                    ->collection('avatar')
                    ->columnSpan('full')
                    ->image()
                    ->imageEditor()
                    ->imageCropAspectRatio('1:1'),

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('avatar')->collection('avatar')->conversion('thumb@2x'),

                TextColumn::make('role')
                    ->label('Role')
                    ->getStateUsing(fn (User $user): string => Str::title($user->roles->first()->name))
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
                TextColumn::make('username')
                    ->label('Username')
                    ->sortable()
                    ->searchable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                EditAction::make(),
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

    public static function shouldSkipAuthorization(): bool
    {
        return app()->isLocal();
    }
}
