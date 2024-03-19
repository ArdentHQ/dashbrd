<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Collection;
use Closure;
use Illuminate\Database\Eloquent\Builder;

trait InteractsWithCollections
{
    /**
     * @param  Closure(Collection, int):void  $callback
     * @param  Closure(Builder<Collection>):Builder<Collection>|null  $queryCallback
     */
    public function forEachCollection(Closure $callback, ?Closure $queryCallback = null, ?int $limit = null): void
    {
        // Apply `$queryCallback` to modify the query before fetching collections...

        if ($this->option('collection-id')) {
            $collection = Collection::query()
                ->select('collections.*')
                ->where('collections.id', '=', $this->option('collection-id'))
                ->withoutSpamContracts()
                ->first();

            $collection && $callback($collection, 0);

            return;
        }

        $limit = $limit ?? $this->option('limit');
        $offset = $this->option('offset');

        Collection::query()
                    ->when($queryCallback !== null, $queryCallback)
                    ->select('collections.*')
                    ->withoutSpamContracts()
                    ->orderBy('id', 'asc')
                    ->when($offset !== null, fn ($q) => $q->skip($offset))
                    ->when($limit !== null, function ($query) use ($limit, $callback) {
                        return $query->limit($limit)->get()->each($callback);
                    })
                    ->when($limit == null, function ($query) use ($callback) {
                        return $query->chunk(
                            count: 100,
                            callback: fn ($chunk, $index) => $chunk->each($callback, $index)
                        );
                    });
    }
}
