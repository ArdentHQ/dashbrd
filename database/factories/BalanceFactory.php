<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Token;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Balance>
 */
class BalanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'wallet_id' => fn () => Wallet::factory(),
            'token_id' => fn () => Token::factory(),
            'balance' => fake()->numberBetween(200, 500000),
        ];
    }
}
