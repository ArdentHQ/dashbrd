<?php

declare(strict_types=1);

namespace App\Support;

final class DataSampler
{
    /**
     * @param  array<mixed>  $items
     * @return array<mixed>
     */
    public static function sample(array $items, int $size): array
    {
        $indexes = self::getSampleIndexes($items, $size);

        return array_values(array_intersect_key($items, array_flip($indexes)));
    }

    /**
     * @param  array<mixed>  $items
     * @return array<int>
     */
    private static function getSampleIndexes(array $items, int $size): array
    {
        $totalItems = count($items);

        if ($size === 0 || $totalItems === 0) {
            return [];
        }

        if ($size === 1) {
            return [0];
        }

        if ($totalItems <= $size) {
            return range(0, $totalItems - 1);
        }

        $step = floor($totalItems / ($size - 1));

        $sampleIndexes = [0];

        $middleItemsCount = max(0, min($size - 1, $totalItems - 1));

        for ($i = 1; $i < $middleItemsCount; $i = $i + 1) {
            $sampleIndexes[] = intval($i * $step);
        }

        $sampleIndexes[] = $totalItems - 1;

        return $sampleIndexes;
    }
}
