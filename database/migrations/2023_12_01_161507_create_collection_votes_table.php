<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Wallet;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Wallet::class, 'wallet_id')->constrained();
            $table->foreignIdFor(Collection::class, 'collection_id')->constrained();
            $table->timestamp('voted_at')->nullable();
        });
    }
};
