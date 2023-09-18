<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\Network;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NetworkData extends Data
{
    public function __construct(
        public string $name,
        public bool $isMainnet,
        public int $chainId,
        public string $publicRpcProvider,
        public string $explorerUrl,
    ) {
    }

    public static function fromModel(Network $network): self
    {
        return new self(
            name: $network->name,
            isMainnet: $network->is_mainnet,
            chainId: $network->chain_id,
            publicRpcProvider: $network->public_rpc_provider,
            explorerUrl: $network->explorer_url
        );
    }
}
