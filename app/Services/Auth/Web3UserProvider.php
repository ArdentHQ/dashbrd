<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Enums\DateFormat;
use App\Models\User;
use App\Models\Wallet;
use App\Support\Currency;
use App\Support\Timezone;
use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Hashing\Hasher;
use Illuminate\Support\Facades\DB;

class Web3UserProvider extends EloquentUserProvider
{
    /**
     * Create a new database user provider.
     *
     * @param  string  $model
     * @return void
     */
    public function __construct($model)
    {
        parent::__construct(app(Hasher::class), $model);
    }

    /**
     * Retrieve a user by the given credentials.
     *
     * @param  array<string, string | null>  $credentials
     * @return Authenticatable|null
     */
    public function retrieveByCredentials(array $credentials)
    {
        $user = null;

        $wallet = Wallet::findByAddress($credentials['address']);

        if ($wallet !== null) {
            return $wallet->user;
        }

        return DB::transaction(function () use ($credentials, $user) {
            if ($user === null) {
                /** @var User $user */
                $user = $this->newModelQuery()->create([
                    'extra_attributes' => [
                        'currency' => Currency::guessCodeFromLocale($credentials['locale'] ?? 'en-US'),
                        'date_format' => DateFormat::D->value,
                        'time_format' => '24',
                        'timezone' => Timezone::find($credentials['timezone']),
                    ],
                ]);
            }

            return $this->createWalletsForUser($user, $credentials);
        });
    }

    /**
     * Validate a user against the given credentials.
     *
     * @param  array<string, string>  $credentials
     * @return bool
     */
    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        /** @var User $user */
        return $user->wallets()->where('address', $credentials['address'])->exists();

    }

    /**
     * Create and associate wallets for the user.
     *
     * @param  User  $user
     * @param  array<string, string>  $credentials
     */
    private function createWalletsForUser(Authenticatable $user, array $credentials): Authenticatable
    {
        $wallet = $user->wallets()->create([
            'address' => $credentials['address'],
            'total_usd' => 0,
        ]);

        $user->wallet()->associate($wallet->id)->save();

        return $user;
    }
}
