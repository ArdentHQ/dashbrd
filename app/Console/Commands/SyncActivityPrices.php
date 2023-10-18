<?php

declare(strict_types=1);

namespace App\Console\Commands;

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

            $updateSql = "
                UPDATE nft_activity
                SET
                  total_native = (extra_attributes->'recipientPaid'->>'totalNative')::numeric,
                  total_usd = (extra_attributes->'recipientPaid'->>'totalNative')::numeric *
                              (
                                SELECT price
                                FROM token_price_history
                                WHERE
                                  token_guid = 'ethereum'
                                  AND timestamp <= nft_activity.timestamp
                                ORDER BY timestamp DESC
                                LIMIT 1
                              )
                WHERE
                  collection_id IN (
                    SELECT collection_id
                    FROM collections
                    WHERE network_id = 1
                  );
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
