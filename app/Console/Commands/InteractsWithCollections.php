<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Collection;
use App\Models\SpamContract;
use Closure;
use Illuminate\Database\Eloquent\Builder;

trait InteractsWithCollections
{
    /**
     * @param  Closure(Collection):void  $callback
     * @param  Closure(Builder<Collection>):Builder<Collection>|null  $queryCallback
     */
    public function forEachCollection(Closure $callback, Closure $queryCallback = null): void
    {
        // Apply `$queryCallback` to modify the query before fetching collections...

        if ($this->option('collection-id')) {
            $collection = Collection::find($this->option('collection-id'));

            if (SpamContract::isSpam($collection->address, $collection->network)) {
                return;
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
                static fn ($collections) => $collections->each($callback)
            );
    }
}
