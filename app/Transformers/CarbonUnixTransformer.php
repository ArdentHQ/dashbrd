<?php

declare(strict_types=1);

namespace App\Transformers;

use Carbon\Carbon;
use Spatie\LaravelData\Support\DataProperty;
use Spatie\LaravelData\Transformers\Transformer;

class CarbonUnixTransformer implements Transformer
{
    public function __construct()
    {
    }

    public function transform(DataProperty $property, mixed $value): int
    {
        /** @var Carbon $value */
        return $value->unix();
    }
}
