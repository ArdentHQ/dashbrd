<?php

declare(strict_types=1);

namespace App\Data\Collections;

use App\Models\CollectionTrait;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[LiteralTypeScriptType([
    'displayType' => 'string',
    'name' => 'string',
    '/** Use the displayType to infer the actual type. */ value' => 'string | number',
    '/** Only present for numeric displayTypes. */ valueMin' => '?number',
    '/** Only present for numeric displayTypes. */ valueMax' => '?number',
    'nftsCount' => 'number',
    'nftsPercentage' => 'number',
])]
class CollectionTraitData extends Data
{
    public function __construct(
        public string $displayType,
        public string $name,
        public string|float $value,
        public ?float $valueMin,
        public ?float $valueMax,
        public float $nftsCount,
        public float $nftsPercentage,
    ) {
    }

    public static function fromModel(CollectionTrait $trait): self
    {
        return new self(
            displayType: $trait['display_type'],
            name: $trait->name,
            value: self::extractValue($trait),
            valueMin: $trait['value_min'] ?? null,
            valueMax: $trait['value_max'] ?? null,
            nftsCount: $trait['nfts_count'],
            nftsPercentage: $trait['nfts_percentage'],
        );
    }

    private static function extractValue(CollectionTrait $trait): string|float
    {
        return $trait->pivot->value_string ?? $trait->pivot->value_numeric ?? $trait->pivot->value_date;
    }
}
