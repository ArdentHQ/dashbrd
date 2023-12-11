<?php

declare(strict_types=1);

use App\Models\Collection;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('floor_price_history', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Collection::class)->constrained()->cascadeOnDelete();
            $table->addColumn('numeric', 'floor_price', ['numeric_type' => 'numeric'])->nullable();
            $table->timestamps();
        });
    }
};
