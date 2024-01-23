<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\Period;
use App\Jobs\FetchCollectionVolumeForPeriod as FetchCollectionVolumeForPeriodJob;
use Exception;
use Illuminate\Console\Command;

class FetchCollectionVolumeForPeriod extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-periodic-volume {--collection-id=} {--period=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the initial periodic volume stats for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $period = $this->option('period');

        if ($period !== null && ! in_array($period, ['1d', '7d', '30d'])) {
            $this->error('Invalid period value. Supported: 1d, 7d, 30d');

            return Command::FAILURE;
        }

        $this->forEachCollection(function ($collection) {
            collect($this->periods())->each(fn ($period) => FetchCollectionVolumeForPeriodJob::dispatch($collection, $period));
        });

        return Command::SUCCESS;
    }

    /**
     * @return Period[]
     */
    private function periods(): array
    {
        if ($this->option('period') === null) {
            return [
                Period::DAY,
                Period::WEEK,
                Period::MONTH,
            ];
        }

        return [match ($this->option('period')) {
            '1d' => Period::DAY,
            '7d' => Period::WEEK,
            '30d' => Period::MONTH,
            default => throw new Exception('Unsupported period value'),
        }];
    }
}
