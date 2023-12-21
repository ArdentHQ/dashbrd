<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionMetadataJob;
use App\Models\Collection;
use App\Models\Network;
use Illuminate\Console\Command;
use Illuminate\Support\Collection as IlluminateCollection;
use Illuminate\Support\Facades\Log;

class FetchCollectionMetadata extends Command
{
    /**
     * Alchemy API supports up to 100 contract addresses per request
     *
     * @see https://docs.alchemy.com/reference/getcontractmetadatabatch
     */
    const CHUNK_SIZE = 100;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-metadata';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch collection metadata in batch';

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
                ->chunkById(self::CHUNK_SIZE, function (IlluminateCollection $collections) use ($network) {
                    $addresses = $collections->pluck('address')->toArray();

                    Log::info('Dispatching FetchCollectionMetadataJob', [
                        'network_id' => $network->id,
                        'collection_addresses' => $addresses,
                    ]);

                    FetchCollectionMetadataJob::dispatch($addresses, $network);
                });
        });

        return Command::SUCCESS;
    }
}
