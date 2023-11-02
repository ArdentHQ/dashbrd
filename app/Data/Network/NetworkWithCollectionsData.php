<?php

declare(strict_types=1);

namespace App\Data\Network;

use App\Models\Network;
use App\Models\User;
use Illuminate\Support\Collection;
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
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chainId,
        public string $publicRpcProvider,
        public string $explorerUrl,
        public int $collectionsCount,
    ) {
    }

    /**
     * @return Collection<int, NetworkWithCollectionsData>
     */
    public static function fromModel(User $user, bool $showHidden)
    {
        $networks = Network::onlyActive()->get();

        return $networks->map(function ($network) use ($user, $showHidden) {
            $collectionCount = $user->collections()
                ->where('network_id', $network->id)
                ->where(
                    fn ($q) => $showHidden
                        ? $q->whereIn('collections.id', $user->hiddenCollections->modelKeys())
                        : $q->whereNotIn('collections.id', $user->hiddenCollections->modelKeys())
                )->count();

            return new NetworkWithCollectionsData(
                $network->id,
                $network->name,
                $network->is_mainnet,
                $network->chain_id,
                $network->public_rpc_provider,
                $network->explorer_url,
                $collectionCount
            );
        });
    }
}
