<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Network>
 */
class NetworkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'name' => fn () => fake()->unique()->name(),
            'chain_id' => fn () => fake()->unique()->numberBetween(138, 9999), // Avoid clashing with ETH (1), Goerli (5), Polygon (137)
            'public_rpc_provider' => fn () => 'https://matic-mumbai.chainstacklabs.com/',
            'explorer_url' => fn () => 'https://mumbai.polygonscan.com',
            'is_mainnet' => fn () => fake()->boolean(),
        ];
    }
}
