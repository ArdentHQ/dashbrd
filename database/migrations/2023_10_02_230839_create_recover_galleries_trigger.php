<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        dd(get_query('migrations.create_recover_galleries_trigger'));
        DB::unprepared(get_query('migrations.create_recover_galleries_trigger'));
    }
};
