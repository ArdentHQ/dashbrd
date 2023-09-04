<?php

namespace App\Filament\Widgets;

use App\Models\Collection;
use App\Models\Nft;
use App\Models\Wallet;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class OverviewStats extends StatsOverviewWidget
{
    protected function getCards(): array
    {
        $ttl = now()->addHours(1);

        return [
            Stat::make('Number of Wallets', fn () => Cache::remember('filament:widgets:wallets', $ttl, fn () => Wallet::count())),

            Stat::make('Number of NFTs', fn () => Cache::remember('filament:widgets:nfts', $ttl, fn () => Nft::count())),

            Stat::make('Number of wallet-owned NFTs', fn () => Cache::remember('filament:widgets:owned-nfts', $ttl, fn () => Nft::whereNotNull('wallet_id')->count())),

            Stat::make('Average NFTs per wallet', fn () => Cache::remember('filament:widgets:nfts-per-wallet', $ttl,
                function () {
                    $wallets = Wallet::count();

                    if ($wallets === 0) {
                        return 0;
                    }

                    return (round(Nft::whereNotNull('wallet_id')->count() / $wallets, 2)*100).'%';
                }
            )),

            Stat::make('Average collections per wallet', fn () => Cache::remember('filament:widgets:collections-per-wallet', $ttl,
                function () {
                    $wallets = Wallet::count();

                    if ($wallets === 0) {
                        return 0;
                    }

                    return (round(Collection::count() / $wallets, 2)*100).'%';
                }
            )),

            Stat::make('Number of collections for wallet-owned NFTs', fn () => Cache::remember('filament:widgets:collections-owned-nfts', $ttl,
                function () {
                    return Nft::whereNotNull('wallet_id')->distinct('collection_id')->count();
                }
            )),
        ];
    }
}
