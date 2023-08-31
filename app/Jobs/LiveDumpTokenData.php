<?php

declare(strict_types=1);

namespace App\Jobs;

use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class LiveDumpTokenData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param  array<array-key, mixed>  $data
     */
    public function __construct(public array $data, public ?Carbon $retryUntil = null)
    {
        //
    }

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [
            (new WithoutOverlapping('store-token-data-in-json-file'))->releaseAfter(1),
        ];
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $fs = Storage::disk('live-dump');

        if ($fs->exists('tokens.json')) {
            /** @var string */
            $jsonData = $fs->get('tokens.json');
            /** @var array<mixed> */
            $arrayData = json_decode($jsonData, true);

            $previous = collect($arrayData);
        } else {
            $previous = collect([]);
        }

        $updatedCollection = $previous->merge($this->data)
            ->unique(fn ($item) => $item['address'].':'.$item['network_id'])
            ->values()
            ->all();

        /** @var string */
        $jsonData = json_encode($updatedCollection, JSON_PRETTY_PRINT);
        $fs->put('tokens.json', $jsonData);
    }

    public function retryUntil(): \DateTime
    {
        return $this->retryUntil ?? Carbon::now()->addMinutes(5);
    }
}
