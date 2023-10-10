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
        // This migration reads the same file as `2023_03_29_080204_create_prune_galleries_trigger.php`
        // however the query on the file is an updated query which is going to
        // drop the old trigger and replace it on production environments or in
        // cases where the migration was already ran.
        DB::unprepared(get_query('migrations.create_prune_galleries_trigger'));
    }
};
