<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\TokenGuid;
use App\Support\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TokenPrice>
 */
class TokenPriceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'token_guid' => fn () => TokenGuid::factory(),
            'currency' => Str::lower(fake()->randomElement(Currency::codes())),
            'price' => fake()->randomFloat(2, 0.005, 3.5),
            'price_change_24h' => fake()->randomFloat(3, -30.0, 150.0),
        ];
    }
}
