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
        Schema::create('collection_winners', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Collection::class)->constrained()->cascadeOnDelete();
            $table->unsignedInteger('votes');
            $table->unsignedSmallInteger('month');
            $table->unsignedSmallInteger('year');
            $table->timestamps();

            $table->unique(['collection_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_winners');
    }
};
