<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TokenPrice>
 */
class TokenPriceHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            // select between ['ethereum', 'matic-network']
            'token_guid' => fake()->randomElement(['ethereum', 'matic-network']),
            'currency' => 'usd',
            'price' => fake()->randomFloat(2, 0.005, 3.5),
            'timestamp' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
