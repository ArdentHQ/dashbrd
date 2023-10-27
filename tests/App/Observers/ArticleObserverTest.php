<?php

declare(strict_types=1);

use App\Jobs\ConvertArticleToSpeech;
use App\Models\Article;
use Illuminate\Support\Facades\Bus;

beforeEach(function () {
    config(['dashbrd.text_to_speech.enabled' => true]);
});

it('should not start audio conversion if text-to-speech is not enabled', function () {
    config(['dashbrd.text_to_speech.enabled' => false]);

    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::assertNotDispatched(ConvertArticleToSpeech::class);
});

it('should not start audio conversion if article is not published', function () {
    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => null,
    ]);

    Bus::assertNotDispatched(ConvertArticleToSpeech::class);
});

it('should not start audio conversion if article content did not change', function () {
    $article = Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ])->fresh();

    Bus::fake();

    $article->update([
        'title' => 'Updated title',
    ]);

    Bus::assertNotDispatched(ConvertArticleToSpeech::class);
});

it('should not start audio conversion if article is published and recently created', function () {
    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::assertDispatched(ConvertArticleToSpeech::class);
});

it('should start preparing audio when an article created', function () {
    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::assertDispatched(ConvertArticleToSpeech::class);
});

it('should start preparing audio when an article content is updated', function () {
    $article = Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::fake();

    $article->update([
        'content' => 'Updated content',
    ]);

    Bus::assertDispatched(ConvertArticleToSpeech::class);
});

it('should start preparing audio when an article is published', function () {
    $article = Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => null,
    ]);

    Bus::fake();

    $article->update([
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::assertDispatched(ConvertArticleToSpeech::class);
});

it('should not start preparing audio on creation if tts is disabled via job', function () {
    ConvertArticleToSpeech::disable();

    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::assertNotDispatched(ConvertArticleToSpeech::class);

    ConvertArticleToSpeech::enable();
});
