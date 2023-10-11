<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('nfts', function (Blueprint $table) {
            $table->timestamp('metadata_requested_at')->nullable();
            $table->timestamp('metadata_fetched_at')->nullable();
        });
    }
};
