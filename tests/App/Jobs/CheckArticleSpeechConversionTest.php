<?php

declare(strict_types=1);

use App\Enums\TextToSpeechConversionStatus;
use App\Jobs\CheckArticleSpeechConversion;
use App\Models\Article;
use Tests\Stubs\FakeTextToSpeechProvider;

it('reports an exception if conversion has failed', function () {
    $article = Article::factory()->create();

    $mock = $this->mock(FakeTextToSpeechProvider::class, function ($mock) {
        $mock->shouldReceive('status')->andReturn(TextToSpeechConversionStatus::Failed);
    });

    (new CheckArticleSpeechConversion($article, 'dummy-conversion-id'))->handle($mock);
})->expectException(Exception::class);

it('releases the job back onto the queue when conversion is still running', function () {
    $article = Article::factory()->create();

    $mock = $this->mock(FakeTextToSpeechProvider::class, function ($mock) {
        $mock->shouldReceive('status')->andReturn(TextToSpeechConversionStatus::Running);
    });

    $fakeJob = new class($article, 'dummy-conversion-id') extends CheckArticleSpeechConversion
    {
        public static ?int $releaseDelay = null;

        public function release($delay = 0)
        {
            self::$releaseDelay = $delay;
        }
    };

    $fakeJob->handle($mock);

    expect($fakeJob::$releaseDelay)->toBe(3);
});

it('stores the audio file url when conversion is completed', function () {
    $article = Article::factory()->create([
        'audio_file_url' => null,
    ])->fresh();

    $mock = $this->mock(FakeTextToSpeechProvider::class, function ($mock) {
        $mock->shouldReceive('status')->andReturn(TextToSpeechConversionStatus::Completed);
        $mock->shouldReceive('ensureFileIsPublic');
        $mock->shouldReceive('url')->andReturn('some-dummy-url');
    });

    (new CheckArticleSpeechConversion($article, 'dummy-conversion-id'))->handle($mock);

    expect($article->fresh()->audio_file_url)->toBe('some-dummy-url');
});

it('should have a retryUntil value', function () {
    $article = Article::factory()->create([
        'audio_file_url' => null,
    ]);

    $job = new CheckArticleSpeechConversion($article, 'dummy-conversion-id');

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});
