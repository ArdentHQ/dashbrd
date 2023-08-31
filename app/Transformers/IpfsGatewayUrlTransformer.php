<?php

declare(strict_types=1);

namespace App\Transformers;

use App\Enums\IpfsGateway;
use Spatie\LaravelData\Support\DataProperty;
use Spatie\LaravelData\Transformers\Transformer;

class IpfsGatewayUrlTransformer implements Transformer
{
    public function __construct()
    {
    }

    public function transform(DataProperty $property, mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return IpfsGateway::Cloudflare->format($value);
    }
}
