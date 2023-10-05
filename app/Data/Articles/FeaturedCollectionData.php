<?php

declare(strict_types=1);

namespace App\Data\Articles;

use App\Models\Collection;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[MapInputName(SnakeCaseMapper::class)]
class FeaturedCollectionData extends Data
{
    public function __construct(
        public string $name,
        public ?string $image,
    ) {
    }

    public static function fromModel(Collection $collection): self
    {
        return new self(
            name: $collection->name,
            image: $collection->image
        );
    }
}
