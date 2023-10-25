<?php


use App\Jobs\ConvertArticleToSpeech;
use App\Models\Article;
use Illuminate\Support\Facades\Bus;

it("should not start audio conversion if text-to-speech is not enabled", function () {
    config(['dashbrd.text_to_speech.enabled' => false]);

    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::assertNotDispatched(ConvertArticleToSpeech::class);
});

it("should not start audio conversion if article is not published", function () {
    config(['dashbrd.text_to_speech.enabled' => true]);

    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => null,
    ]);

    Bus::assertNotDispatched(ConvertArticleToSpeech::class);
});

it('should not start audio conversion if article content did not change', function () {
    config(['web.text_to_speech.enabled' => true]);

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
    config(['web.text_to_speech.enabled' => true]);

    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::assertDispatched(ConvertArticleToSpeech::class);
});

it("should start preparing audio when an article created", function () {
    config(['dashbrd.text_to_speech.enabled' => true]);

    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ])->fresh();

    Bus::assertDispatched(ConvertArticleToSpeech::class);
});

it("should start preparing audio when an article content is updated", function () {
    config(['dashbrd.text_to_speech.enabled' => true]);


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

it("should start preparing audio when an article is published", function () {
    config(['dashbrd.text_to_speech.enabled' => true]);

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
    config(['web.text_to_speech.enabled' => true]);
    ConvertArticleToSpeech::disable();

    Bus::fake();

    Article::factory()->create([
        'content' => 'Hello World',
        'published_at' => now()->subMinutes(2),
    ]);

    Bus::assertNotDispatched(ConvertArticleToSpeech::class);
});
