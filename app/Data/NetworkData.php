<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\Network;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
#[LiteralTypeScriptType([
    'name' => 'string',
    'chainId' => 'number',
    'isMainnet' => 'boolean',
    'publicRpcProvider' => 'string',
    'explorerUrl' => 'string',
])]
class NetworkData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public bool $isMainnet,
        public int $chainId,
        public string $publicRpcProvider,
        public string $explorerUrl,
    ) {
    }

    public static function fromModel(Network $network): self
    {
        return new self($network['id'], $network['name'], $network['is_mainnet'], $network['chain_id'], $network['public_rpc_provider'], $network['explorer_url']);
    }
}
