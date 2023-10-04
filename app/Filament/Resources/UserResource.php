<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\Role;
use App\Filament\Resources\UserResource\Pages\CreateUser;
use App\Filament\Resources\UserResource\Pages\EditUser;
use App\Filament\Resources\UserResource\Pages\ListUsers;
use App\Models\Role as RoleModel;
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
                    ->afterStateHydrated(function (Select $component, $state) use ($form) {
                        /** @var User|null */
                        $user = $form->getRecord();
                        /** @var RoleModel|null $role */
                        $role = $user?->roles()->first();

                        if ($role !== null) {
                            $component->state($role->name);
                        }
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
                    ->getStateUsing(function (User $user): string {
                        /** @var RoleModel */
                        $role = $user->roles()->first();

                        return Str::title($role->name);
                    })
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
        /** @var Builder<User> */
        $query = parent::getEloquentQuery();

        return $query->managers();
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUsers::route('/'),
            'create' => CreateUser::route('/create'),
            'edit' => EditUser::route('/{record}/edit'),
        ];
    }

    public static function shouldSkipAuthorization(): bool
    {
        return app()->isLocal();
    }
}
