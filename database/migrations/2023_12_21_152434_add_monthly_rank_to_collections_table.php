<?php

declare(strict_types=1);

use App\Jobs\ResetCollectionRanking;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->unsignedInteger('monthly_rank')->nullable();
            $table->unsignedInteger('monthly_votes')->nullable();
        });

        ResetCollectionRanking::dispatchSync();
    }
};
