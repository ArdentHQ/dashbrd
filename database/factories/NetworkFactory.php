<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Token;
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

    /**
     * Modify the model factory to create a native token after network was created.
     * This is done to prevent bugs for missing native tokens, as every network has one.
     */
    public function withNativeToken(): self
    {
        return $this->afterCreating(function ($network) {
            Token::factory()->for($network)->create([
                'is_native_token' => true,
            ]);
        });
    }
}
