<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->string('volume_1d')->nullable();
            $table->string('volume_7d')->nullable();
            $table->string('volume_30d')->nullable();

            $table->dropColumn([
                'avg_volume_1d',
                'avg_volume_7d',
                'avg_volume_30d',
            ]);
        });
    }
};
