<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

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
            'xFollowersFormatted' => format_amount_for_display((int) Cache::get('twitter_followers', 0)),
            'discordMembersFormatted' => format_amount_for_display((int) Cache::get('discord_members', 0)),
            'wallets' => Cache::remember('landing:wallets', now()->addMinutes(5), static fn () => number_format(Wallet::count())),
        ]);
    }
}
