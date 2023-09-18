<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\Chains;
use App\Models\Network;
use App\Models\SpamContract;
use App\Support\Facades\Alchemy;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SyncSpamContracts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync-spam-contracts {--chain-id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Alchemy spam contracts';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $chain = Chains::from($this->option('chain-id') === null ? 1 : (int) $this->option('chain-id'));

        /** @var Network $network */
        $network = Network::query()->where('chain_id', $chain)->first();

        $networkId = $network->id;

        $freshContracts = collect(Alchemy::getSpamContracts($network));

        $contractsToClean = collect();

        // identify addresses from the database that are no longer classified as spam.
        SpamContract::query()
            ->select(['id', 'address'])
            ->where('network_id', $networkId)
            ->chunkById(
                200,
                fn (Collection $existingContracts) => $contractsToClean->push($existingContracts->pluck('address')->diff($freshContracts)),
                $column = 'id'
            );

        $now = Carbon::now();

        $freshContracts->chunk(100)->map(function ($chunk) use ($networkId, $now) {
            $dataToInsert = $chunk->map(fn ($address) => [
                'address' => $address,
                'network_id' => $networkId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $inserted = SpamContract::query()->insertOrIgnore($dataToInsert->toArray());

            if ($inserted > 0) {
                Log::info("Added $inserted Spam Contracts (If not exist already)", [
                    'address' => $dataToInsert->pluck('address')->toArray(),
                    'networkId' => $networkId,
                ]);
            }
        });

        $contractsToClean = $contractsToClean->flatten();

        if ($contractsToClean->isNotEmpty()) {
            Log::info('Deleting Spam Contracts', [
                'address' => $contractsToClean->toArray(),
                'networkId' => $networkId,
            ]);

            SpamContract::query()->whereIn('address', $contractsToClean)->delete();
        }

        return Command::SUCCESS;
    }
}
