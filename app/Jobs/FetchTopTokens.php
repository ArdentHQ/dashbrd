<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\MarketData\Providers\CoingeckoProvider;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchTopTokens implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $count = 250,
        public int $page = 1,
        public ?Carbon $retryUntil = null
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(CoingeckoProvider $provider): void
    {
        $tokenIds = $provider->topTokenIds(
            perPage: $this->count,
            page: $this->page
        );

        foreach ($tokenIds as $tokenId) {
            FetchTokenByCoingeckoId::dispatch($tokenId, $this->retryUntil);
        }
    }

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return app(CoingeckoProvider::class)->getJobMiddleware();
    }

    public function uniqueId(): string
    {
        return 'fetch-top-tokens:'.$this->count.':'.$this->page;
    }
}
