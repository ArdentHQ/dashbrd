<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CollectionWinner>
 */
class CollectionWinnerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'collection_id' => Collection::factory(),
            'votes' => random_int(1, 1000),
            'month' => random_int(1, 12),
            'year' => random_int(2020, 2023),
            'rank' => random_int(1, 3),
        ];
    }
}
