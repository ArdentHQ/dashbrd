<?php

declare(strict_types=1);

namespace App\Enums;

enum ScheduleFrequency: string
{
    case Hourly = 'hourly';
    case Daily = 'daily';
}
