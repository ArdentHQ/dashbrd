<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Enums\TextToSpeechConversionStatus;
use App\Models\Article;

interface TextToSpeechProvider
{
    public function convert(Article $article): string;

    public function status(string $conversionId): TextToSpeechConversionStatus;

    public function url(string $conversionId): string;
}
