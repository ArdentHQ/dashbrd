<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Collection;
use App\Models\Wallet;
use Brick\Math\BigInteger;
use Database\Factories\Traits\RandomTimestamps;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Nft>
 */
class NftFactory extends Factory
{
    use RandomTimestamps;

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
            'name' => fn () => fake()->name(),
            'token_number' => fn () => (string) BigInteger::of(fake()->unique()->numberBetween(50, 1000) * 1e18),
            'extra_attributes' => json_encode([
                'images' => [
                    'thumb' => fn () => fake()->imageUrl(360, 360, 'animals', true),
                    'small' => fn () => fake()->imageUrl(360, 360, 'animals', true),
                    'large' => fn () => fake()->imageUrl(360, 360, 'animals', true),
                ],
            ]),
        ];
    }
}
