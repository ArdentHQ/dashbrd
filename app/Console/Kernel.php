<?php

declare(strict_types=1);

namespace App\Console;

use App\Console\Commands\FetchCoingeckoTokens;
use App\Console\Commands\FetchCollectionBanner;
use App\Console\Commands\FetchCollectionFloorPrice;
use App\Console\Commands\FetchCollectionNfts;
use App\Console\Commands\FetchEnsDetails;
use App\Console\Commands\FetchNativeBalances;
use App\Console\Commands\FetchTokens;
use App\Console\Commands\FetchWalletNfts;
use App\Console\Commands\MaintainGalleries;
use App\Console\Commands\MarketData\FetchPriceHistory;
use App\Console\Commands\MarketData\UpdateTokenDetails;
use App\Console\Commands\MarketData\VerifySupportedCurrencies;
use App\Console\Commands\SyncSpamContracts;
use App\Console\Commands\UpdateCollectionsFiatValue;
use App\Console\Commands\UpdateDiscordMembers;
use App\Console\Commands\UpdateGalleriesScore;
use App\Console\Commands\UpdateGalleriesValue;
use App\Console\Commands\UpdateTwitterFollowers;
use App\Enums\Features;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use Laravel\Pennant\Feature;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule
            ->command(VerifySupportedCurrencies::class)
            ->withoutOverlapping()
            ->weeklyOn(Schedule::MONDAY, '10:00');

        // Every 15 minutes for top tokens (prioritized on the command)
        $schedule
            ->command(UpdateTokenDetails::class, [
                '--limit='.$this->maxCoingeckoJobsInInterval(),
            ])
            ->withoutOverlapping()
            ->everyFifteenMinutes();

        // Once a day for rest of tokens (since being online is a big factor
        // in prioritization we can assume that user will see his tokens details
        // updated when he is online)
        $schedule
            ->command(UpdateTokenDetails::class, [
                '--skip='.$this->maxCoingeckoJobsInInterval(),
            ])
            ->withoutOverlapping()
            ->dailyAt('19:00');

        $schedule
            ->command(FetchEnsDetails::class)
            ->withoutOverlapping()
            ->hourlyAt(0);

        $schedule->command(UpdateTwitterFollowers::class)->dailyAt('0:30');

        $schedule->command(UpdateDiscordMembers::class)->dailyAt('0:45');

        // Misc...
        $schedule->command('telescope:prune')->dailyAt('1:00');
        $schedule->command('horizon:snapshot')->everyFiveMinutes();
        $schedule->command('queue:prune-batches --hours=48')->dailyAt('1:10');

        if (Feature::active(Features::Portfolio->value)) {
            $this->scheduleJobsForPortfolio($schedule);
        }

        if (Feature::active(Features::Collections->value)) {
            $this->scheduleJobsForCollections($schedule);
        }

        if (Feature::active(Features::Galleries->value)) {
            $this->scheduleJobsForGalleries($schedule);
        }

        if (Feature::active(Features::Galleries->value) || Feature::active(Features::Collections->value)) {
            $this->scheduleJobsForCollectionsOrGalleries($schedule);
        }

        $schedule
            ->command(FetchCoingeckoTokens::class)
            ->withoutOverlapping()
            ->twiceMonthly(1, 16);
    }

    private function scheduleJobsForCollectionsOrGalleries(Schedule $schedule): void
    {
        $schedule
            ->command(FetchCollectionFloorPrice::class)
            ->withoutOverlapping()
            ->hourlyAt(5);

        $schedule
            ->command(FetchWalletNfts::class)
            ->withoutOverlapping()
            ->hourlyAt(10); // offset by 10 mins so it's not run the same time as FetchEnsDetails...
    }

    private function scheduleJobsForGalleries(Schedule $schedule): void
    {
        $schedule
            ->command(UpdateGalleriesScore::class)
            ->withoutOverlapping()
            ->hourlyAt(2);

        $schedule
            ->command(UpdateGalleriesValue::class)
            ->withoutOverlapping()
            ->everyThirtyMinutes();

        $schedule
            ->command(MaintainGalleries::class)
            ->withoutOverlapping()
            ->hourlyAt(30); // since this dispatches same jobs as `FetchWalletNfts`, spread it out as much as possible (offset by 30 mins)...
    }

    private function scheduleJobsForCollections(Schedule $schedule): void
    {
        $schedule
            ->command(UpdateCollectionsFiatValue::class)
            ->withoutOverlapping()
            ->everyThirtyMinutes();

        // Fetch banners for collections that don't have one yet
        $schedule
            ->command(FetchCollectionBanner::class, [
                '--missing-only',
            ])
            ->withoutOverlapping()
            ->dailyAt('5:30');

        $schedule
            ->command(FetchCollectionNfts::class)
            ->withoutOverlapping()
            ->dailyAt('11:00');

        $schedule
            ->command(SyncSpamContracts::class)
            ->withoutOverlapping()
            ->twiceMonthly();
    }

    private function scheduleJobsForPortfolio(Schedule $schedule): void
    {
        $schedule
            ->command(FetchPriceHistory::class, [
                '--period='.config('dashbrd.wallets.line_chart.period'),
            ])
            ->withoutOverlapping()
            ->dailyAt('13:00');

        $schedule
            ->command(FetchTokens::class)
            ->withoutOverlapping()
            ->dailyAt('14:15'); // offset by 15 mins from FetchEnsDetails so they dont run at the same time...

        $schedule
            ->command(FetchNativeBalances::class)
            ->withoutOverlapping()
            ->dailyAt('14:45'); // offset by 30 mins from FetchTokens so they dont run at the same time...

        $schedule
            ->command(FetchNativeBalances::class, [
                '--only-online',
            ])
            ->withoutOverlapping()
            ->everyFiveMinutes();

        $schedule
            ->command(FetchTokens::class, [
                '--only-online',
            ])
            ->withoutOverlapping()
            ->everyFiveMinutes();
    }

    private function maxCoingeckoJobsInInterval(): int
    {
        // Depends on the frequency of the command, currently `everyFifteenMinutes`)
        $scheduledEverySeconds = 15 * 60;
        $maxRequest = (int) config('services.coingecko.rate.max_requests');
        $perSeconds = (int) config('services.coingecko.rate.per_seconds');

        // Give 5 minutes of room for other tasks
        $thresholdForOtherTasksSeconds = 5 * 60;

        return (int) ceil($maxRequest / ($perSeconds / ($scheduledEverySeconds - $thresholdForOtherTasksSeconds)));
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
