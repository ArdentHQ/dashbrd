<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Creates a trigger for inserts, updates and deletes respectively
        // which runs at the end of each statement on the balances table and
        // recalculates the `total_usd` column.
        // If balances are updated in batch (=many inserts in one statement), the trigger only runs once.

        // Depending on how we decide to update the balances in the future and also that it needs to react to
        // usd rate changes, the triggers likely have to be tweaked or replace altogether with another solution.

        // language=postgresql
        DB::unprepared(<<<'SQL'
CREATE OR REPLACE FUNCTION update_wallets_total_usd() RETURNS TRIGGER AS $_$
BEGIN
    WITH affected_wallets AS (
        SELECT DISTINCT (wallet_id) FROM delta
    )
    UPDATE wallets w
    SET total_usd = COALESCE((
        SELECT SUM(balance / POW(10, t.decimals) * tp.price)
        FROM balances b 
        JOIN tokens t ON t.id = b.token_id
        JOIN token_prices tp on tp.token_guid = t.token_guid AND tp.currency = 'usd'
        WHERE b.wallet_id = w.id
    ), 0)
    FROM affected_wallets aw
    WHERE w.id = aw.wallet_id;

    RETURN NULL;
END;
$_$ LANGUAGE plpgsql;

CREATE TRIGGER update_wallets_total_usd_on_insert
    AFTER INSERT ON balances
    REFERENCING new TABLE AS delta
    FOR EACH STATEMENT EXECUTE PROCEDURE update_wallets_total_usd();

CREATE TRIGGER update_wallets_total_usd_on_update
    AFTER UPDATE ON balances
    REFERENCING new TABLE AS delta
    FOR EACH STATEMENT EXECUTE PROCEDURE update_wallets_total_usd();

CREATE TRIGGER update_wallets_total_usd_on_delete
    AFTER DELETE ON balances
    REFERENCING old TABLE AS delta
    FOR EACH STATEMENT EXECUTE PROCEDURE update_wallets_total_usd();
SQL);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // language=postgresql
        DB::unprepared('
DROP TRIGGER IF EXISTS update_wallets_total_usd_on_insert;
DROP TRIGGER IF EXISTS update_wallets_total_usd_on_update;
DROP TRIGGER IF EXISTS update_wallets_total_usd_on_delete;
');
    }
};
