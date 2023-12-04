<?php

declare(strict_types=1);

namespace App\Models;

use App\Data\UserData;
use App\Enums\CurrencyCode;
use App\Enums\Role;
use App\Models\Traits\BelongsToWallet;
use App\Models\Traits\HasWallets;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Jeffgreco13\FilamentBreezy\Traits\TwoFactorAuthenticatable;
use Spatie\LaravelData\WithData;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Spatie\Permission\Traits\HasRoles;
use Spatie\SchemalessAttributes\Casts\SchemalessAttributes;

class User extends Authenticatable implements FilamentUser, HasMedia, HasName
{
    /** @use WithData<UserData> */
    use BelongsToWallet, HasFactory, HasWallets, InteractsWithMedia, Notifiable, SoftDeletes, TwoFactorAuthenticatable, WithData;
    use HasRoles {
        assignRole as baseAssignRole;
    }

    protected string $dataClass = UserData::class;

    /**
     * The attributes that are not mass assignable.
     *
     * @var array<int, string>
     */
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'extra_attributes' => SchemalessAttributes::class,
        'collections_value' => 'json',
    ];

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('avatar')
            ->singleFile()
            ->registerMediaConversions(function () {
                $this
                    ->addMediaConversion('thumb')
                    ->width(54)
                    ->height(54);

                $this
                    ->addMediaConversion('thumb@2x')
                    ->width(54 * 2)
                    ->height(54 * 2);
            });
    }

    public function currency(): CurrencyCode
    {
        $currency = CurrencyCode::tryFrom(Str::upper(Arr::get($this, 'extra_attributes.currency', CurrencyCode::USD->value)));

        return $currency;
    }

    /**
     * @return HasMany<Gallery>
     */
    public function galleries(): HasMany
    {
        return $this->hasMany(Gallery::class);
    }

    /**
     * @return HasManyThrough<Nft>
     */
    public function nfts(): HasManyThrough
    {
        return $this->hasManyThrough(Nft::class, Wallet::class);
    }

    /**
     * @return Builder<Collection>
     */
    public function collections(): Builder
    {
        return Collection::whereIn('collections.id', function ($query) {
            return $query->select('collection_id')->from('nfts')->whereIn('nfts.wallet_id', $this->wallets()->select('id'));
        });
    }

    /**
     * @return BelongsToMany<Collection>
     */
    public function hiddenCollections(): BelongsToMany
    {
        return $this->belongsToMany(Collection::class, 'hidden_collections');
    }

    public function collectionsValue(CurrencyCode $currency, bool $readFromDatabase = true, bool $onlyHidden = null): ?float
    {
        if (! $readFromDatabase) {
            $query = get_query($onlyHidden ? 'users.calculate_collections_value_hidden' : 'users.calculate_collections_value_shown', [
                'hiddenCollectionIds' => $this->hiddenCollections->modelKeys(),
            ]);

            return json_decode(DB::table('users')
                ->selectRaw($query)
                ->where('users.id', $this->id)
                ->value('result'), true)[$currency->value] ?? null;
        }

        return Arr::get($this->collections_value, $currency->value);
    }

    /**
     * @param  array<int>  $usersIds
     */
    public static function updateCollectionsValue(array $usersIds = []): void
    {
        $calculateValueQuery = get_query('users.calculate_collections_value');

        $usersIds = implode(',', $usersIds);

        User::query()
            ->when(! empty($usersIds), function ($query) use ($usersIds) {
                $query->whereRaw("users.id IN (SELECT users.id FROM users WHERE users.id IN ({$usersIds}) FOR UPDATE SKIP LOCKED)");
            })
            ->update(['collections_value' => DB::raw($calculateValueQuery)]);
    }

    /**
     * Overrides the base Spatie method so it allows us to call the method with enum values, example:
     * $user->assignRole(Role::Writer);.
     *
     * @param  array<int, string|Role|\App\Models\Role>  $roles
     */
    public function assignRole(array $roles = []): self
    {
        return $this->baseAssignRole(array_map(static fn ($role) => $role instanceof Role ? $role->value : $role, $roles));
    }

    public function getFilamentName(): string
    {
        return 'Admin User';
    }

    public function canAccessPanel(Panel $panel): bool
    {
        if (app()->isLocal()) {
            return true;
        }

        try {
            return $this->hasPermissionTo('admin:access', 'admin');
        } catch (PermissionDoesNotExist $e) {
            return false;
        }
    }

    /**
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    public function scopeManagers(Builder $query): Builder
    {
        return $query->whereHas('roles', function ($query) {
            $query->whereIn('name', [Role::Admin->value, Role::Superadmin->value, Role::Editor->value]);
        });
    }
}
