<?php

declare(strict_types=1);

namespace App\Data;

use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[LiteralTypeScriptType([
    '/** 96x96 */ thumb' => 'string | null',
    '/** 256x256 */ small' => 'string | null',
    '/** 512x512 */ large' => 'string | null',
])]
class ImagesData extends Data
{
    public function __construct(
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $thumb,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $small,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $large,
    ) {
    }
}
