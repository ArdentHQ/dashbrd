<?php

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
            $table->boolean('is_fetching_activity')->default(false)->after('minted_at');
            $table->timestamp('activity_updated_at')->nullable()->after('is_fetching_activity');
        });
    }
};
