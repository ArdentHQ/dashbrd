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
        $articles = Article::factory()->createMany(10);

        $network = Network::query()->first();

        if (! $network) {
            $network = Network::factory()->create();
        }

        $articles->map(function ($article) use ($network) {
            $imageUrl = fake()->imageUrl(640, 480, null, false);
            $article->addMediaFromUrl($imageUrl)->toMediaCollection();

            $collections = Collection::factory(2)->createMany([
                'network' => $network->id,
            ]);

            $article->collections()->attach($collections, ['order_index' => 1]);
        });

    }
}
