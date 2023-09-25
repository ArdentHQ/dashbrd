<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\FetchCollectionNfts as FetchCollectionNftsJob;
use App\Models\Collection;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;

class FetchCollectionNfts extends Command
{
    use InteractsWithCollections;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'collections:fetch-nfts {--collection-id=} {--start-token=} {--only-signed}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch all NFTs for collections';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $onlySigned = (bool) $this->option('only-signed');

        if ($onlySigned) {
            Collection::getWithSignedWallet()->each(function (Collection $collection) {
                if (! $collection->isBlacklisted()) {
                    FetchCollectionNftsJob::dispatch(
                        $collection,
                        $this->option('start-token') ?? $collection->last_indexed_token_number
                    );
                }
            });
        } else {
            $this->forEachCollection(function ($collection) {
                if (! $collection->isBlacklisted()) {
                    FetchCollectionNftsJob::dispatch(
                        $collection,
                        $this->option('start-token') ?? $collection->last_indexed_token_number
                    );
                }
            }, queryCallback: fn (Builder $query) => $query->withAcceptableSupply());
        }

        return Command::SUCCESS;
    }
}
