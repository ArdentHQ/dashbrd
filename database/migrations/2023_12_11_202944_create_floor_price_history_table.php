<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Token;
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
            $table->foreignIdFor(Token::class, 'floor_price_token_id')->nullable()->cascadeOnDelete();
            $table->timestamps();
        });
    }
};
