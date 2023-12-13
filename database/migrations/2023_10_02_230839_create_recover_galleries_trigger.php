<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $query = get_query('migrations.create_recover_galleries_trigger');

        if (empty($query)) {
            dd('Empty recover!');
        }

        DB::unprepared($query);
    }
};
