<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('galleries_stats', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('total_galleries');
            $table->bigInteger('total_distinct_users');
            $table->bigInteger('total_distinct_collections');
            $table->bigInteger('total_distinct_nfts');

            $table->timestamps();
        });

        DB::unprepared(get_query('migrations.create_galleries_stats_triggers'));
    }
};
