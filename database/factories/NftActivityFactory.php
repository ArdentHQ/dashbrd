<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\NftTransferType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NftActivity>
 */
class NftActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => fn () => $this->faker->randomElement([
                NftTransferType::Mint,
                NftTransferType::Transfer,
                NftTransferType::Sale,
            ]),
            'sender' => '0x'.fake()->sha1(),
            'recipient' => '0x'.fake()->sha1(),
            'tx_hash' => '0x'.fake()->sha1(),
            'timestamp' => fake()->dateTimeBetween('-1 year', 'now'),
            'extra_attributes' => [],
        ];
    }
}
