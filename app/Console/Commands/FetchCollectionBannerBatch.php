<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionBannerBatch as FetchCollectionBannerJob;
use App\Models\Collection;
use App\Models\Network;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection as IlluminateCollection;
use Illuminate\Support\Facades\Log;

class FetchCollectionBannerBatch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nfts:fetch-collection-banner-batch {--missing-only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the latest banner for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $networks = Network::query()->whereIn('id', function ($query) {
            $query->select('network_id')
                ->from('collections')
                ->groupBy('network_id');
        })->get();

        $networks->map(function ($network) {
            Collection::query()
                ->select(['id', 'address'])
                ->where('network_id', '=', $network->id)
                ->when($this->option('missing-only'), function (Builder $query) {
                    $query->whereNull('extra_attributes->banner');
                })
                ->chunkById(100, function (IlluminateCollection $collections) use ($network) {
                    $addresses = $collections->pluck('address')->toArray();

                    Log::info('Dispatching FetchCollectionBannerJob', [
                        'network_id' => $network->id,
                        'collection_addresses' => $addresses,
                    ]);

                    if ($collections->isNotEmpty()) {
                        FetchCollectionBannerJob::dispatch($addresses, $network);
                    }
                });
        });

        return Command::SUCCESS;
    }
}
