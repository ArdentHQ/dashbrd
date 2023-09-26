<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ArticleCategoryEnum;
use App\Models\Article;
use App\Models\User;
use Database\Factories\Traits\RandomTimestamps;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
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
            'title' => fake()->name(),
            'category' => fake()->randomElement([ArticleCategoryEnum::News->value]),
            'published_at' => fake()->date(),
            'meta_description' => fake()->text(),
            'content' => fake()->text(),
            'user_id' => fn () => User::factory()->withWallet(),
        ];
    }
}
