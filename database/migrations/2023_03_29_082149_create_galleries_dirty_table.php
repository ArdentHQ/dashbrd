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
        Schema::create('galleries_dirty', function (Blueprint $table) {
            // NOTE: no foreign key, because we use this for cache invalidation and
            // the referenced gallery might no longer exist, while the `gallery_id` is part
            // of the cache key we have to evict.
            $table->bigInteger('gallery_id')->unique();
        });
    }
};
