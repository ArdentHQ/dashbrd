<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Database\Factories\Traits\RandomTimestamps;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Gallery>
 */
class GalleryFactory extends Factory
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
            'user_id' => fn () => User::factory()->withWallet(),
            'name' => fn () => fake()->name(),
            'cover_image' => fn () => fake()->imageUrl(640, 360, 'animals', true),
        ];
    }
}
