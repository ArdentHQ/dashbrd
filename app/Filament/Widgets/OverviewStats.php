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
            Stat::make('Number of Wallets', static fn() => Cache::remember('filament:widgets:wallets', $ttl, static fn() => Wallet::count())),

            Stat::make('Number of NFTs', static fn() => Cache::remember('filament:widgets:nfts', $ttl, static fn() => Nft::count())),

            Stat::make('Number of wallet-owned NFTs', static fn() => Cache::remember('filament:widgets:owned-nfts', $ttl, static fn() => Nft::whereNotNull('wallet_id')->count())),

            Stat::make('Average NFTs per wallet', static fn() => Cache::remember('filament:widgets:nfts-per-wallet', $ttl,
                static function () {
                    $wallets = Wallet::count();
                    if ($wallets === 0) {
                        return 0;
                    }

                    return (round(Nft::whereNotNull('wallet_id')->count() / $wallets, 2)*100).'%';
                }
            )),

            Stat::make('Average collections per wallet', static fn() => Cache::remember('filament:widgets:collections-per-wallet', $ttl,
                static function () {
                    $wallets = Wallet::count();
                    if ($wallets === 0) {
                        return 0;
                    }

                    return (round(Collection::count() / $wallets, 2)*100).'%';
                }
            )),

            Stat::make('Number of collections for wallet-owned NFTs', static fn() => Cache::remember('filament:widgets:collections-owned-nfts', $ttl,
                static function () {
                    return Nft::whereNotNull('wallet_id')->distinct('collection_id')->count();
                }
            )),
        ];
    }
}
