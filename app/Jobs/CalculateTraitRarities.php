<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Collection;
use App\Models\CollectionTrait;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\DB;

class CalculateTraitRarities implements ShouldQueue
{
    use Batchable, Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @param  SupportCollection<int, CollectionTrait>  $traits
     */
    public function __construct(
        public Collection $collection,
        public SupportCollection $traits
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $values = $this->traits->map(
            fn ($trait) => sprintf('(%s, %s)', $trait->id, $this->getRarity($trait))
        )->join(', ');

        DB::transaction(function () use ($values) {
            DB::update('
                UPDATE collection_traits
                SET nfts_percentage = c.nfts_percentage
                FROM (values '.$values.') AS c(id, nfts_percentage)
                WHERE c.id = collection_traits.id
            ');
        }, attempts: 3);
    }

    /**
     * Calculate the rarity of the trait based on number of NFTs that have the same trait.
     */
    private function getRarity(CollectionTrait $trait): float
    {
        $count = $this->collection->nfts()->whereHas('traits', function ($q) use ($trait) {
            return $q->where('name', $trait->name)->where('value', $trait->value);
        })->count();

        return round($count / $this->collection->supply, 4);
    }
}
