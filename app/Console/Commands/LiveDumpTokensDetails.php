<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchTopTokens as Job;
use App\Support\Queues;
use Carbon\Carbon;
use Illuminate\Console\Command;

class LiveDumpTokensDetails extends Command
{
    const MAX_PER_PAGE = 250;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tokens:live-dump {--count=1000}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch top N tokens and dump them in a json file';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        /** @var int */
        $count = (int) $this->option('count');

        $pages = (int) ceil($count / self::MAX_PER_PAGE);

        for ($page = 1; $page <= $pages; $page++) {
            $missing = $count - (self::MAX_PER_PAGE * ($page - 1));

            $pageSize = min(self::MAX_PER_PAGE, $count, $missing);

            $this->info("Fetching {$pageSize} items from page {$page} of {$pages}");

            Job::dispatch(
                count: $pageSize,
                page: $page,
                retryUntil: $this->getRetryUntil($count)
            )->onQueue(Queues::TOKENS);
        }

        return Command::SUCCESS;
    }

    private function getRetryUntil(int $count): Carbon
    {
        $requests = config('services.coingecko.rate.max_requests');

        $seconds = config('services.coingecko.rate.per_seconds');

        $hoursRequired = ceil(ceil($count / $requests) * $seconds / 60 / 60);

        // The job need to be retried during a long time because is throttled
        // so Im calculating the hours required to fetch all the tokens
        return Carbon::now()->addHours((int) $hoursRequired);
    }
}
