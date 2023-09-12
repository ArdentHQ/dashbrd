<?php

declare(strict_types=1);

namespace App\Data\Network;

use App\Models\Network;
use App\Models\User;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class NetworkWithCollectionsData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public bool $isMainnet,
        #[LiteralTypeScriptType('App.Enums.Chains')]
        public int $chainId,
        public string $publicRpcProvider,
        public string $explorerUrl,
        public int $collectionsCount,
    ) {
    }

    /**
     * @return \Illuminate\Support\Collection<int, NetworkWithCollectionsData>
     */
    public static function fromModel(User $user, bool $showHidden)
    {
        $networks = Network::scopeOnlyActive()->get();
        $collectionsPerNetwork = $networks->mapWithKeys(function ($network) use ($user, $showHidden) {
            return [$network->id => $user->collections()->where('network_id', $network->id)->when($showHidden, fn ($q) => $q->whereIn('collections.id', $user->hiddenCollections->modelKeys()))->count()];
        });

        $networksWithCollectionsCount = $networks->map(function ($network) use ($collectionsPerNetwork) {
            return new NetworkWithCollectionsData(
                $network->id,
                $network->name,
                $network->is_mainnet,
                $network->chain_id,
                $network->public_rpc_provider,
                $network->explorer_url,
                $collectionsPerNetwork[$network->id] ?? 0
            );
        });

        return $networksWithCollectionsCount;
    }
}
