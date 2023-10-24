<?php

declare(strict_types=1);

use App\Enums\TextToSpeechConversionStatus;
use App\Models\Article;
use App\Services\TextToSpeech\Polly;
use Aws\Polly\PollyClient;
use Aws\S3\S3Client;

it('can convert the article to audio version', function () {
    $article = Article::factory()->create([
        'content' => '**_Hello World_**',
    ]);

    $this->mock(PollyClient::class, function ($mock) use ($article) {
        $mock->shouldReceive('startSpeechSynthesisTask')->with([
            'Engine' => 'neural',
            'OutputFormat' => 'mp3',
            'OutputS3BucketName' => config('services.polly.bucket'),
            'OutputS3KeyPrefix' => $article->id.'/en',
            'Text' => 'Hello World'.PHP_EOL,
            'VoiceId' => 'Matthew',
        ])->andReturn([
            'SynthesisTask' => [
                'TaskId' => 'conversion-id',
            ],
        ]);
    });

    expect(app(Polly::class)->convert($article))->toBe('conversion-id');
});

it('can get the completed status', function () {
    $this->mock(PollyClient::class, function ($mock) {
        $mock->shouldReceive('getSpeechSynthesisTask')->with([
            'TaskId' => 'conversion-id',
        ])->andReturn([
            'SynthesisTask' => [
                'TaskStatus' => 'completed',
            ],
        ]);
    });

    $polly = app(Polly::class);

    expect($polly->status('conversion-id'))->toBe(TextToSpeechConversionStatus::Completed);
});

it('can get the failed status', function () {
    $this->mock(PollyClient::class, function ($mock) {
        $mock->shouldReceive('getSpeechSynthesisTask')->with([
            'TaskId' => 'conversion-id',
        ])->andReturn([
            'SynthesisTask' => [
                'TaskStatus' => 'failed',
            ],
        ]);
    });

    $polly = app(Polly::class);

    expect($polly->status('conversion-id'))->toBe(TextToSpeechConversionStatus::Failed);
});

it('can get the running status', function () {
    $this->mock(PollyClient::class, function ($mock) {
        $mock->shouldReceive('getSpeechSynthesisTask')->with([
            'TaskId' => 'conversion-id',
        ])->andReturn([
            'SynthesisTask' => [
                'TaskStatus' => 'inProgress',
            ],
        ]);
    });

    $polly = app(Polly::class);

    expect($polly->status('conversion-id'))->toBe(TextToSpeechConversionStatus::Running);
});

it('can get the audio file url', function () {
    $this->mock(PollyClient::class, function ($mock) {
        $mock->shouldReceive('getSpeechSynthesisTask')->with([
            'TaskId' => 'conversion-id',
        ])->andReturn([
            'SynthesisTask' => [
                'OutputUri' => 'some-url',
            ],
        ]);
    });

    $polly = app(Polly::class);

    expect($polly->url('conversion-id'))->toBe('some-url');
});

it('can ensure the audio file is publicly available', function () {
    $article = Article::factory()->create();

    $this->mock(S3Client::class, function ($mock) use ($article) {
        $mock->shouldReceive('putObjectAcl')
            ->once()
            ->with([
                'ACL' => 'public-read',
                'Bucket' => config('services.polly.bucket'),
                'Key' => sprintf('%s/en.some-conversion-id.mp3', $article->id),
            ]);
    });

    app(Polly::class)->ensureFileIsPublic($article, 'some-conversion-id');

    $this->addToAssertionCount(1);
});
