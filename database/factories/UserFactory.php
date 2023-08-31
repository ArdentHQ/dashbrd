<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CurrencyCode;
use App\Enums\DateFormat;
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

    public function withWallet()
    {
        return $this->state(fn () => [
            'wallet_id' => fn () => Wallet::factory(),
        ]);
    }
}
