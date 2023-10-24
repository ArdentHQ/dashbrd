<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\TextToSpeechProvider;
use App\Enums\TextToSpeechConversionStatus;
use App\Models\Article;
use Aws\Polly\PollyClient;
use Aws\S3\S3Client;

// Ignored because we need to mock this class from a test, and it cannot be mocked if it's final...
readonly class Polly implements TextToSpeechProvider
{
    public function __construct(
        private S3Client $s3,
        private PollyClient $polly
    ) {
    }

    public function convert(Article $article): string
    {
        return $this->polly->startSpeechSynthesisTask([
            'Engine' => 'neural',
            'OutputFormat' => 'mp3',
            'OutputS3BucketName' => config('services.polly.bucket'),
            'OutputS3KeyPrefix' => $article->id.'/en',
            'Text' => strip_tags($article->renderedMarkdown()),
            'VoiceId' => 'Matthew',
        ])['SynthesisTask']['TaskId'];
    }

    public function status(string $conversionId): TextToSpeechConversionStatus
    {
        $status = $this->polly->getSpeechSynthesisTask([
            'TaskId' => $conversionId,
        ])['SynthesisTask']['TaskStatus'];

        return match ($status) {
            'completed' => TextToSpeechConversionStatus::Completed,
            'failed' => TextToSpeechConversionStatus::Failed,
            default => TextToSpeechConversionStatus::Running,
        };
    }

    public function url(string $conversionId): string
    {
        return $this->polly->getSpeechSynthesisTask([
            'TaskId' => $conversionId,
        ])['SynthesisTask']['OutputUri'];
    }

    public function ensureFileIsPublic(Article $article, string $conversionId): void
    {
        $this->s3->putObjectAcl([
            'ACL' => 'public-read',
            'Bucket' => config('services.polly.bucket'),
            'Key' => sprintf('%s/en.%s.mp3', $article->id, $conversionId),
        ]);
    }
}
