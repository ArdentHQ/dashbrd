<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Collection;
use App\Models\Token;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FloorPriceHistory>
 */
class FloorPriceHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'collection_id' => fn () => Collection::factory(),
            'floor_price' => (string) (random_int(50, 1000) * 1e18),
            'token_id' => fn () => Token::factory(),
            'retrieved_at' => $this->faker->dateTimeBetween('-3 days', 'now'),
        ];
    }
}
