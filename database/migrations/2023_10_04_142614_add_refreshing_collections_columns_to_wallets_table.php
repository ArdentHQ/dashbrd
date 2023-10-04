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
        Schema::table('wallets', function (Blueprint $table) {
            $table->boolean('is_refreshing_collections')->default(false)->after('extra_attributes');
            $table->boolean('refreshed_collections_at')->nullable()->after('is_refreshing_collections');
        });
    }
};
