<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CurrencyCode;
use App\Enums\DateFormat;
use App\Enums\Role as RoleEnum;
use App\Models\Role;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'username' => fake()->unique()->name(),
            'extra_attributes' => [
                'currency' => CurrencyCode::USD->value,
                'date_format' => DateFormat::D,
                'time_format' => '24',
                'timezone' => 'UTC',
            ],
        ];
    }

    public function withWallet(string $address = null)
    {
        if ($address !== null) {
            return $this->state(fn () => [
                'wallet_id' => fn () => Wallet::factory()->create([
                    'address' => $address,
                ])->id,
            ]);
        }

        return $this->state(fn () => [
            'wallet_id' => Wallet::factory(),
        ]);
    }

    public function editor()
    {
        return $this->afterCreating(function ($user) {
            $user->assignRole([
                Role::where('name', RoleEnum::Editor->value)->where('guard_name', 'admin')->firstOrFail(),
            ])->save();
        });
    }

    public function withAvatar()
    {
        return $this->afterCreating(function ($user) {
            $imageIndex = fake()->numberBetween(1, 3);

            $imagePath = database_path("seeders/fixtures/users/avatars/unsplash-$imageIndex.avif");

            $user->addMedia($imagePath)->preservingOriginal()->toMediaCollection('avatar');
        });
    }
}
