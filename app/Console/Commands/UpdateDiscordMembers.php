<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class UpdateDiscordMembers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'landing:update-discord-members';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates discord members count';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $response = Http::get(config('services.discord.invite_code_api_url'));

        $membersCount = $response->json('approximate_member_count');

        if ($membersCount === null) {
            throw new \Exception('Unable to get discord members count');
        }

        $this->info('Discord members: '.$membersCount);

        Cache::set('discord_members', $membersCount);

        return Command::SUCCESS;
    }
}
