<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Events\WalletBecameActive;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class StoreLastActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(Request):Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($this->shouldStoreActivity($user)) {
            $this->storeActivity($user);
        }

        return $next($request);
    }

    private function shouldStoreActivity(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        return Cache::missing($this->getCacheKey($user));
    }

    private function storeActivity(User $user): void
    {
        $wallet = $user->wallet;

        if ($this->isWalletInactive($wallet)) {
            event(new WalletBecameActive($wallet));
        }

        $wallet->update(['last_activity_at' => Carbon::now()]);

        Cache::set($this->getCacheKey($user), true, config('dashbrd.user_activity_ttl'));
    }

    private function isWalletInactive(Wallet $wallet): bool
    {
        return Wallet::recentlyActive()
            ->where('id', $wallet->id)
            ->doesntExist();
    }

    private function getCacheKey(User $user): string
    {
        return 'recently_stored_last_activity-'.$user->wallet_id;
    }
}
