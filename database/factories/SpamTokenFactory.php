<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Token;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SpamToken>
 */
class SpamTokenFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'reason' => fake()->realText(),
            'token_id' => fn () => Token::factory(),
        ];
    }
}
