<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Collection;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $articles = Article::factory()->createMany(10);

        $articles->map(function ($article) {
            $imageUrl = fake()->imageUrl(640,480, null, false);
            $article->addMediaFromUrl($imageUrl)->toMediaCollection();

            $collections = Collection::factory()->createMany(2);

            $article->collections()->attach($collections, ['order_index' => 1]);
        });

    }
}
