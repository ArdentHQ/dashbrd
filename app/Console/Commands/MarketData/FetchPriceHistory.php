<?php

declare(strict_types=1);

namespace App\Console\Commands\MarketData;

use App\Enums\Period;
use App\Jobs\FetchPriceHistory as Job;
use App\Models\Token;
use App\Models\User;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class FetchPriceHistory extends Command
{
    protected $signature = 'marketdata:fetch-price-history {--period=}';

    protected $description = 'Retrieves the price history for the given period';

    public function handle(): void
    {
        /**
         * @var string $period
         */
        $period = $this->option('period');

        if (Period::isValid($period) === false) {
            $this->error('Invalid period');

            return;
        }

        $tokens = Token::withBalancesOnMainnet()->get();

        Log::info("tokens with balances", [
            '$tokens' => $tokens->count(),
        ]);

        $currencies = $this->getActiveCurrencies();

        $progressBar = $this->output->createProgressBar($tokens->count() * $currencies->count());

        $currencies->each(function (string $currency) use ($tokens, $progressBar, $period) {
            $tokens->each(function (Token $token) use ($progressBar, $period, $currency) {
                Job::dispatch(
                    token: $token,
                    period: Period::from($period),
                    currency: $currency,
                )->onQueue(Queues::SCHEDULED_DEFAULT);

                $progressBar->advance();
            });
        });

        $progressBar->finish();
    }

    /**
     * @return Collection<int, string>
     */
    private function getActiveCurrencies(): Collection
    {
        return User::query()
            ->select('extra_attributes->currency as currency')
            ->distinct()
            ->where('extra_attributes->currency', '!=', 'USD')
            ->pluck('currency')
            ->prepend('USD');
    }
}
