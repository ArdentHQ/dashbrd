<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Collection;
use App\Models\Network;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $network = Network::query()->first();

        if (! $network) {
            $network = Network::factory()->create();

        }

        $articlesData = collect(json_decode(file_get_contents(database_path('seeders/fixtures/articles/articles.json')), true));

        $articlesData->shuffle()->take(10)->each(function ($articleData) {
            $article = Article::factory()->create([
                'title' => $articleData['name'],
                'category' => 'news',
                'published_at' => $articleData['published_at'],
                'content' => $articleData['body'],
            ]);

            $imagePath = database_path('seeders/fixtures/articles/images/'.$articleData['slug'].'.png');

            $article->addMedia($imagePath)->preservingOriginal()->toMediaCollection('cover');

            $collections = Collection::all()->random(8);

            $article->collections()->attach($collections, ['order_index' => 1]);
        });

    }
}
