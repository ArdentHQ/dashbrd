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
        $query = get_query('migrations.create_prune_galleries_trigger');

        if (empty($query)) {
            dd('Empty prune!');
        }

        DB::unprepared($query);
    }
};
