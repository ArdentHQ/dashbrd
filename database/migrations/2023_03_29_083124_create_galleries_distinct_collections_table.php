<?php

declare(strict_types=1);

use App\Models\Collection;
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
        Schema::create('galleries_distinct_collections', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Collection::class)->unique()->constrained()->cascadeOnDelete();
        });
    }
};
