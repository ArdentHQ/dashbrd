<?php

declare(strict_types=1);

use App\Jobs\ConvertArticleToSpeech;
use App\Models\Article;
use Illuminate\Support\Facades\Bus;

beforeEach(function () {
    config(['dashbrd.text_to_speech.enabled' => true]);
});

it('dispatches a job for the specific article', function () {
    $article = Article::factory()->published()->create();

    Bus::fake();

    $this->artisan('articles:generate-audio-file '.$article->id);

    Bus::assertDispatchedTimes(ConvertArticleToSpeech::class, 1);
    Bus::assertDispatched(ConvertArticleToSpeech::class, fn ($job) => $job->article->is($article));
});

it('does not dispatch a job if tts is disabled via config value', function () {
    config(['dashbrd.text_to_speech.enabled' => false]);

    $article = Article::factory()->published()->create();

    Bus::fake();

    $this->artisan('articles:generate-audio-file '.$article->id);

    Bus::assertNothingDispatched();
});

it('does not dispatch a job if tts is disabled via a job', function () {
    ConvertArticleToSpeech::disable();

    $article = Article::factory()->published()->create();

    Bus::fake();

    $this->artisan('articles:generate-audio-file '.$article->id);

    Bus::assertNothingDispatched();

    ConvertArticleToSpeech::enable();
});

it('dispatches a job for the range of articles', function () {
    $first = Article::factory()->published()->create();
    $second = Article::factory()->published()->create();
    $third = Article::factory()->published()->create();

    Bus::fake();

    $this->artisan(sprintf('articles:generate-audio-file --from=%s --to=%s', $first->id, $second->id));

    Bus::assertDispatchedTimes(ConvertArticleToSpeech::class, 2);
    Bus::assertDispatched(ConvertArticleToSpeech::class, fn ($job) => $job->article->isNot($third));
});

it('dispatches a job for the cli invocation with only starting article', function () {
    $first = Article::factory()->published()->create();
    $second = Article::factory()->published()->create();
    $third = Article::factory()->published()->create();

    Bus::fake();

    $this->artisan(sprintf('articles:generate-audio-file --from=%s', $second->id));

    Bus::assertDispatchedTimes(ConvertArticleToSpeech::class, 2);
    Bus::assertDispatched(ConvertArticleToSpeech::class, fn ($job) => $job->article->isNot($first));
});

it('dispatches a job for the cli invocation with only ending article', function () {
    $first = Article::factory()->published()->create();
    $second = Article::factory()->published()->create();
    $third = Article::factory()->published()->create();

    Bus::fake();

    $this->artisan(sprintf('articles:generate-audio-file --to=%s', $second->id));

    Bus::assertDispatchedTimes(ConvertArticleToSpeech::class, 2);
    Bus::assertDispatched(ConvertArticleToSpeech::class, fn ($job) => $job->article->isNot($third));
});

it('can only query articles with missing audio files', function () {
    $first = Article::factory()->published()->create();
    $second = Article::factory()->published()->create([
        'audio_file_url' => 'some-url',
    ]);
    $third = Article::factory()->published()->create();

    Bus::fake();

    $this->artisan(sprintf('articles:generate-audio-file --from=%s --to=%s --missing', $first->id, $third->id));

    Bus::assertDispatchedTimes(ConvertArticleToSpeech::class, 2);
    Bus::assertDispatched(ConvertArticleToSpeech::class, fn ($job) => $job->article->isNot($second));
});

it('displays warning if nothing is done', function () {
    Bus::fake();

    $this->artisan('articles:generate-audio-file --from=1 --to=10')->expectsOutput('No articles found.');

    Bus::assertNotDispatched(ConvertArticleToSpeech::class);
});

it('only queries published articles', function () {
    $first = Article::factory()->published()->create();
    $second = Article::factory()->notPublished()->create();
    $third = Article::factory()->published()->create();

    Bus::fake();

    $this->artisan(sprintf('articles:generate-audio-file --from=%s --to=%s --missing', $first->id, $third->id));

    Bus::assertDispatchedTimes(ConvertArticleToSpeech::class, 2);
    Bus::assertDispatched(ConvertArticleToSpeech::class, fn ($job) => $job->article->isNot($second));
});
