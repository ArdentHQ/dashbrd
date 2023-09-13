<?php

declare(strict_types=1);

namespace App\Enums;

enum ImageSize: string
{
    case Thumb = 'thumb';
    case Small = 'small';
    case Large = 'large';
    case Banner = 'banner';

    public static function defaultList(): array
    {
        return [
            ImageSize::Thumb,
            ImageSize::Small,
            ImageSize::Large,
        ];
    }

    public function width(): int
    {
        return match ($this) {
            ImageSize::Thumb => 96,
            ImageSize::Small => 256,
            ImageSize::Large => 512,
            ImageSize::Banner => 1378,
        };
    }

    public function height(): int
    {
        return match ($this) {
            ImageSize::Thumb => 96,
            ImageSize::Small => 256,
            ImageSize::Large => 512,
            ImageSize::Banner => 400,
        };
    }
}
