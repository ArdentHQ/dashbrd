<?php

declare(strict_types=1);

use App\Jobs\ConvertArticleToSpeech;
use App\Jobs\CheckArticleSpeechConversion;
use App\Models\Article;
use Illuminate\Support\Facades\Bus;
use Tests\App\Services\FakeTextToSpeechProvider;

it('dispatches another conversion job', function () {
    $article = Article::factory()->create();

    Bus::fake();

    $mock = $this->mock(FakeTextToSpeechProvider::class, function ($mock) {
        $mock->shouldReceive('convert')->andReturn('dummy-conversion-id');
    });

    (new ConvertArticleToSpeech($article))->handle($mock);

    Bus::assertDispatched(CheckArticleSpeechConversion::class, fn ($job) => $job->article->is($article) && $job->conversionId === 'dummy-conversion-id');
});

it('can be disabled and enabled', function () {
    expect(ConvertArticleToSpeech::$enabled)->toBeTrue();

    ConvertArticleToSpeech::disable();

    expect(ConvertArticleToSpeech::$enabled)->toBeFalse();

    ConvertArticleToSpeech::enable();

    expect(ConvertArticleToSpeech::$enabled)->toBeTrue();
});
