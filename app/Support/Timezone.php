<?php

declare(strict_types=1);

namespace App\Support;

use Carbon\CarbonTimeZone;
use DateTimeZone;
use Illuminate\Support\Facades\Cache;

final class Timezone
{
    /**
     * @return string[]
     */
    public static function all(): array
    {
        return DateTimeZone::listIdentifiers(DateTimeZone::ALL);
    }

    /**
     * @return array{key: string, label: string}
     */
    public static function formatted(): array
    {
        // Ignore as PHPStan doesn't like Cache::rememberForever's plain "array" return type
        // @phpstan-ignore-next-line
        return Cache::rememberForever('timezones', fn () => collect(self::all())->map(function ($tz) {
            /** @var CarbonTimeZone $timezone */
            $timezone = CarbonTimeZone::instance(new DateTimeZone($tz));

            return [
                'key' => $tz,
                'label' => "(UTC{$timezone->toOffsetName()}) ".str_replace('_', ' ', $tz),
            ];
        })->values()->toArray());
    }
}
