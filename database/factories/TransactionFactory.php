<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Token;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'unique_id' => fake()->unique()->sha1(),
            'wallet_id' => fn () => Wallet::factory(),
            'token_id' => fn () => Token::factory(),
            'hash' => fn () => fake()->sha256(),
            'is_sent' => fake()->boolean(),
            'amount' => fake()->numberBetween(200, 500000),
            'timestamp' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
