<?php

declare(strict_types=1);

namespace App\Services\TextToSpeech;

use App\Contracts\TextToSpeechProvider;
use App\Enums\TextToSpeechConversionStatus;
use App\Models\Article;
use Aws\Polly\PollyClient;

readonly class Polly implements TextToSpeechProvider
{
    public function __construct(private PollyClient $polly)
    {
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
}
