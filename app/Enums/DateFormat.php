<?php

declare(strict_types=1);

namespace App\Enums;

enum DateFormat: string
{
    case A = 'd/m/Y';
    case B = 'm/d/Y';
    case C = 'd M Y';
    case D = 'M d, Y';

    /**
     * @return array{array{key: string, label: string, default: bool}}
     */
    public static function all(): array
    {
        $label = static fn (string $format) => now()->format($format);

        return [
            ['key' => self::A->value, 'label' => $label(self::A->value), 'default' => false],
            ['key' => self::B->value, 'label' => $label(self::B->value), 'default' => false],
            ['key' => self::C->value, 'label' => $label(self::C->value), 'default' => false],
            ['key' => self::D->value, 'label' => $label(self::D->value), 'default' => true],
        ];
    }
}
