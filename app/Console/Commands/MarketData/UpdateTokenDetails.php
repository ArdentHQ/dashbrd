<?php

declare(strict_types=1);

namespace App\Console\Commands\MarketData;

use App\Console\Commands\DependsOnCoingeckoRateLimit;
use App\Jobs\UpdateTokenDetails as UpdateTokenDetailsJob;
use App\Models\Token;
use App\Models\Wallet;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;

class UpdateTokenDetails extends Command
{
    use DependsOnCoingeckoRateLimit;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'marketdata:update-token-details {token_symbol?} {--wallet-id=} {--top} {--no-top}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update token details';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $tokenSymbol = $this->argument('token_symbol');

        $walletId = $this->option('wallet-id');

        if ($walletId) {
            $wallet = Wallet::findOrFail($walletId);

            $this->updateWalletTokenDetails($wallet);
        } elseif (is_string($tokenSymbol)) {
            $tokens = Token::mainnet()->bySymbol($tokenSymbol)->limit(1)->get();

            $this->dispatchJobForTokens($tokens);
        } else {
            $this->updateAllTokenDetails();
        }
    }

    private function updateAllTokenDetails(): void
    {
        $top = $this->option('top');

        $noTop = $this->option('no-top');

        $tokens = Token::mainnet()
            ->when($top || $noTop, function ($query) use ($top) {
                // Consider that the minutes here should match the frequency of
                // the command defined on the `Kernel.php` file, currently `everyFifteenMinutes`
                $limit = $this->getLimitPerMinutes(15);

                dd($limit);

                if ($top) {
                    return $query->limit($limit);
                }

                return $query->skip($limit);
            })
            ->get();

        $this->dispatchJobForTokens($tokens);
    }

    private function updateWalletTokenDetails(Wallet $wallet): void
    {
        $limit = $this->option('limit');

        $tokens = Token::mainnet()
            ->prioritized()
            ->when($limit !== null, fn ($query) => $query->limit((int) $limit))
            ->where('wallet_id', $wallet->id)
            ->get();

        $this->dispatchJobForTokens($tokens);
    }

    /**
     * @param  Collection<int, Token>  $tokens
     */
    private function dispatchJobForTokens(Collection $tokens): void
    {
        $totalTokens = $tokens->count();

        $progressBar = $this->output->createProgressBar($totalTokens);

        $tokens->each(function (Token $token) use ($progressBar) {
            $this->dispatchDelayed(
                callback: fn () => UpdateTokenDetailsJob::dispatch(
                    token: $token,
                ),
                index: $progressBar->getProgress(),
                job: UpdateTokenDetailsJob::class,
                // @see comment on `DependsOnCoingeckoRateLimit.php` file
                delayThreshold: $this->option('no-top') ? 1 : null,
            );

            $progressBar->advance();
        });

        $progressBar->finish();
    }
}
