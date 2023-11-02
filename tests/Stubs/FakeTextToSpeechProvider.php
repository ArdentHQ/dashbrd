<?php

declare(strict_types=1);

namespace Tests\Stubs;

use App\Contracts\TextToSpeechProvider;
use App\Enums\TextToSpeechConversionStatus;
use App\Models\Article;

class FakeTextToSpeechProvider implements TextToSpeechProvider
{
    public function convert(Article $article): string
    {
        return 'dummy-conversion-id';
    }

    public function status(string $conversionId): TextToSpeechConversionStatus
    {
        return TextToSpeechConversionStatus::Running;
    }

    public function url(string $conversionId): string
    {
        return '';
    }
}
