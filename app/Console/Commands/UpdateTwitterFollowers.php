<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Atymic\Twitter\Facade\Twitter;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class UpdateTwitterFollowers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'landing:update-twitter-followers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates the twitter followers';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = Arr::get(Twitter::getUser('me', [
            'user.fields' => 'public_metrics',
            'response_format' => 'array',
        ]), 'data.public_metrics.followers_count');

        if ($count === null) {
            throw new \Exception('Unable to get Twitter followers count');
        }

        $this->info('Twitter followers: '.$count);

        Cache::set('twitter_followers', $count);

        return Command::SUCCESS;
    }
}
