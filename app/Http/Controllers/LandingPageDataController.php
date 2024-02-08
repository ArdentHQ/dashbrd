<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Number;

class LandingPageDataController extends Controller
{
    public function __invoke(): JsonResponse
    {
        if (! Cache::has('twitter_followers') && config('twitter.consumer_key') !== null) {
            Artisan::call('landing:update-twitter-followers');
        }

        if (! Cache::has('discord_members') && config('services.discord.invite_code_api_url') !== null) {
            Artisan::call('landing:update-discord-members');
        }

        return response()->json([
            'xFollowersFormatted' => $this->format((int) Cache::get('twitter_followers', 0)),
            'discordMembersFormatted' => $this->format((int) Cache::get('discord_members', 0)),
            'wallets' => Cache::remember('landing:wallets', now()->addMinutes(5), static fn () => number_format(Wallet::count())),
        ]);
    }

    private function format(int $amount): string
    {
        /** @var string */
        $value = Number::abbreviate($amount, maxPrecision: 1);

        return strtolower($value);
    }
}
