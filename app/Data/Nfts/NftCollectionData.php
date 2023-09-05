<?php

declare(strict_types=1);

namespace App\Data\Nfts;

use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Attributes\WithTransformer;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NftCollectionData extends Data
{
    public function __construct(
        public string $name,
        public string $slug,
        public ?string $description,
        public string $address,
        #[LiteralTypeScriptType('App.Enums.Chains')]
        public int $chainId,
        public ?string $floorPrice,
        public ?string $website,
        #[WithTransformer(IpfsGatewayUrlTransformer::class)]
        public ?string $image,
    ) {
    }

    public static function fromModel(Collection $collection, CurrencyCode $currencyCode = null): self
    {
        return new self(
            name: $collection->name,
            slug: $collection->slug,
            description: $collection->description,
            address: $collection->address,
            chainId: $collection->network->chain_id,
            floorPrice: $collection->floor_price,
            website: $collection->website(),
            image: $collection->extra_attributes->get('image'),
        );
    }
}
