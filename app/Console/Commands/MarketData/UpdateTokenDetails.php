<?php

declare(strict_types=1);

namespace App\Console\Commands\MarketData;

use App\Jobs\UpdateTokenDetails as UpdateTokenDetailsJob;
use App\Models\Token;
use App\Models\Wallet;
use App\Support\Queues;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class UpdateTokenDetails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'marketdata:update-token-details {token_symbol?} {--wallet-id=} {--limit=} {--skip=}';

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
        $limit = $this->option('limit');

        $skip = $this->option('skip');

        $tokens = Token::mainnet()
            ->prioritized()
            ->when($limit !== null, fn ($query) => $query->limit((int) $limit))
            ->when($skip !== null, fn ($query) => $query->skip((int) $skip))
            ->get();

        Log::info('Dispatching UpdateTokenDetails Job', [
            'tokens' => $tokens->pluck('address')->toArray(),
        ]);

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

        Log::info('Dispatching UpdateTokenDetails Job for Wallet', [
            'wallet' => $wallet->address,
            'tokens' => $tokens->pluck('address')->toArray(),
        ]);

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
            UpdateTokenDetailsJob::dispatch(
                token: $token,
            )->onQueue(Queues::TOKENS);

            $progressBar->advance();
        });

        $progressBar->finish();
    }
}
