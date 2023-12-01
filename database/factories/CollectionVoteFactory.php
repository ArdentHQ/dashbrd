<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Collection;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CollectionVote>
 */
class CollectionVoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wallet_id' => fn () => Wallet::factory(),
            'collection_id' => fn () => Collection::factory(),
            'voted_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
