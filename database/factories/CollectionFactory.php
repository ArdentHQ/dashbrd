<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Network;
use App\Models\Token;
use Carbon\Carbon;
use Database\Factories\Traits\RandomTimestamps;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Collection>
 */
class CollectionFactory extends Factory
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
            'network_id' => fn () => Network::factory(),
            'name' => fn () => fake()->name(),
            'symbol' => fn () => fake()->name(),
            'address' => '0x'.fake()->sha1(), // To imitate an address
            'supply' => fn () => random_int(5000, 10000),
            'floor_price' => (string) (random_int(50, 1000) * 1e18),
            'floor_price_token_id' => fn () => Token::factory(),
            'floor_price_retrieved_at' => Carbon::now(),
            'minted_block' => random_int(1, 10000),
            'extra_attributes' => fn () => json_encode([
                'image' => fake()->imageUrl(360, 360, 'animals', true),
                'website' => fake()->url(),
            ]),
            'is_featured' => fn () => random_int(0, 1),
        ];
    }
}
