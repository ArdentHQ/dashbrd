<?php

declare(strict_types=1);

namespace App\Enums;

enum TextToSpeechConversionStatus: string
{
    case Running = 'running';
    case Completed = 'completed';
    case Failed = 'failed';
}
