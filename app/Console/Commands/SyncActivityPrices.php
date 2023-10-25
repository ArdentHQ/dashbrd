<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\Chains;
use App\Enums\TokenGuid;
use App\Models\Network;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncActivityPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'activities:sync-prices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command to update NFT activity records of a collection with calculated values';

    /**
     * Command to update NFT activity records of a collection with calculated values
     *
     * This command updates the 'nft_activity' table by calculating and setting the 'total_native' and 'total_usd' columns based on the
     * values stored in the 'extra_attributes' column from the 'token_price_history' table. The
     * command performs the following actions:
     *
     * 1. For each record in 'nft_activity':
     *   - Extract the 'totalNative' value from the 'extra_attributes' JSON column and set it as 'total_native'.
     *   - Calculate 'total_usd' by multiplying 'total_native' with the 'ethereum' token price from 'token_price_history'
     *     for the time that activity happened.
     *
     * 2. Update is limited to records in 'nft_activity' associated with collections having a 'network_id' of 1 (Polygon in our app).
     *
     * 3. The command uses a SQL transaction to ensure data consistency. It commits the changes after successful execution.
     *
     * Caution: Before running this command, make sure to run `tokens:live-dump-price-history`.
     */
    public function handle(): int
    {
        try {
            DB::beginTransaction();
            $this->info('Updating NFT activity table...');

            $network = Network::firstWhere('chain_id', Chains::Polygon);
            $ethereumGuid = TokenGuid::Ethereum->value;
            $polygonGuid = TokenGuid::Polygon->value;

            $updateSql = "
                UPDATE nft_activity
                SET
                    total_usd = (extra_attributes->'recipientPaid'->>'totalNative')::numeric *
                    (
                        SELECT price
                        FROM token_price_history
                        WHERE
                            token_guid = '{$polygonGuid}'
                            AND currency = 'usd'
                            AND timestamp <= nft_activity.timestamp
                        ORDER BY timestamp DESC
                        LIMIT 1
                    ),
                    total_native = (
                        SELECT (
                            (extra_attributes->'recipientPaid'->>'totalNative')::numeric *
                            (
                                SELECT price
                                FROM token_price_history
                                WHERE
                                    token_guid = '{$polygonGuid}'
                                    AND currency = 'usd'
                                    AND timestamp <= nft_activity.timestamp
                                ORDER BY timestamp DESC
                                LIMIT 1
                            )
                        ) / (
                            SELECT price
                            FROM token_price_history
                            WHERE
                                token_guid = '{$ethereumGuid}'
                                AND timestamp <= nft_activity.timestamp
                                AND currency = 'usd'
                            ORDER BY timestamp DESC
                            LIMIT 1
                        )
                    )
                WHERE
                    nft_activity.collection_id IN (
                        SELECT collections.id
                        FROM collections
                        WHERE collections.network_id = '$network->id'
                    )
                    AND nft_activity.type = 'LABEL_SALE';
            ";

            DB::statement($updateSql);

            DB::commit();

            $this->info('NFT activity table updated successfully.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('An error occurred while updating the NFT activity table: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
