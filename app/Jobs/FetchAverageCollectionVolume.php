<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\Period;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\Collection;
use App\Support\Facades\Mnemonic;
use App\Support\Queues;
use DateTime;
use Exception;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class FetchAverageCollectionVolume implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Collection $collection,
        public Period $period,
    ) {
        $this->onQueue(Queues::SCHEDULED_COLLECTIONS);
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $volume = Mnemonic::getAverageCollectionVolume(
            chain: $this->collection->network->chain(),
            contractAddress: $this->collection->address,
            period: $this->period,
        );

        $this->collection->update([
            $this->field() => $volume ?? 0,
        ]);

        ResetCollectionRanking::dispatch();
    }

    private function field(): string
    {
        return match ($this->period) {
            Period::DAY => 'avg_volume_1d',
            Period::WEEK => 'avg_volume_7d',
            Period::MONTH => 'avg_volume_30d',
            default => throw new Exception('Unsupported period value'),
        };
    }

    public function uniqueId(): string
    {
        return static::class.':'.$this->collection->id;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
