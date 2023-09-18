<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Collection;
use App\Models\SpamContract;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\Log;

trait InteractsWithCollections
{
    /**
     * @param  Closure(Collection):void  $callback
     * @param  Closure(Builder<Collection>):Builder<Collection>|null  $queryCallback
     * @param  (Closure(SupportCollection<int, Collection>):array<mixed>)|null  $getLogData
     */
    public function forEachCollection(Closure $callback, Closure $queryCallback = null, Closure $getLogData = null): void
    {
        // Apply `$queryCallback` to modify the query before fetching collections...

        if ($this->option('collection-id')) {
            $collection = Collection::findOrFail($this->option('collection-id'));

            if (SpamContract::isSpam($collection->address, $collection->network)) {
                return;
            }

            if ($getLogData !== null) {
                Log::info(...$getLogData(collect([$collection])));
            }

            $callback($collection);

            return;
        }

        Collection::query()
            ->when($queryCallback !== null, $queryCallback)
            ->select('collections.*')
            ->withoutSpamContracts()
            ->chunkById(
                100,
                function ($collections) use ($callback, $getLogData) {
                    if ($getLogData !== null) {
                        Log::info(...$getLogData($collections));
                    }

                    $collections->each($callback);
                },
                'collections.id',
                'id'
            );
    }
}
