<?php

declare(strict_types=1);

namespace App\Filament\Widgets;

use App\Models\Collection;
use App\Models\Nft;
use App\Models\Wallet;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OverviewStats extends StatsOverviewWidget
{
    protected function getCards(): array
    {
        $ttl = now()->addHours(1);

        return [
            Stat::make('Number of Wallets', static fn () => Cache::remember('filament:widgets:wallets', $ttl, static fn () => number_format(Wallet::count()))),

            Stat::make('Number of NFTs', static fn () => Cache::remember('filament:widgets:nfts', $ttl, static fn () => number_format(Nft::count()))),

            Stat::make('Number of wallet-owned NFTs', static fn () => Cache::remember('filament:widgets:owned-nfts', $ttl, static fn () => number_format(Nft::whereNotNull('wallet_id')->count()))),

            Stat::make('Number of collections', static fn () => Cache::remember('filament:widgets:collections', $ttl,
                static function () {
                    return Collection::count();
                }
            )),

            Stat::make('Number of collections for wallet-owned NFTs', static fn () => Cache::remember('filament:widgets:collections-owned-nfts', $ttl,
                static function () {
                    return Nft::whereNotNull('wallet_id')->distinct('collection_id')->count();
                }
            )),

            Stat::make('Average NFTs per wallet', static fn () => Cache::remember('filament:widgets:nfts-per-wallet', $ttl,
                static function () {
                    $wallets = Wallet::count();

                    if ($wallets === 0) {
                        return 0;
                    }

                    return round(Nft::whereNotNull('wallet_id')->count() / $wallets, 2);
                }
            )),

            Stat::make('Average collections per wallet', static fn () => Cache::remember('filament:widgets:collections-per-wallet', $ttl,
                static function () {
                    $wallets = Wallet::count();

                    if ($wallets === 0) {
                        return 0;
                    }

                    return round(Collection::count() / $wallets, 2);
                }
            )),

            Stat::make('Most NFTs in a wallet', static fn () => Cache::remember('filament:widgets:most-nfts', $ttl,
                static function () {
                    return Wallet::withCount('nfts')->latest('nfts_count')->first()->nfts_count;
                }
            ))->description('Number of NFTs for a wallet that owns the most NFTs'),

            Stat::make('Most unique collections owned by wallet', static fn () => Cache::remember('filament:widgets:most-collections', $ttl,
                static function () {

                    /** @var object{wallet_id: int, count: int} $result  */
                    $result = DB::table('nfts')
                        ->select(DB::raw('nfts.wallet_id, count(distinct(collection_id))'))
                        ->groupBy('wallet_id')
                        ->limit(1)
                        ->first();
                    return $result->count;
                }
            ))->description('Number of collections for a wallet that owns NFTs in the most collections'),
        ];
    }
}
