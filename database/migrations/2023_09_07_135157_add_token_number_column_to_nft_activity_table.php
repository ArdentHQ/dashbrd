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
        Schema::table('nft_activity', function (Blueprint $table) {
            $table->addColumn('numeric', 'token_number', ['numeric_type' => 'numeric'])->nullable();
            $table->unsignedBigInteger('nft_id')->nullable()->change();
        });
    }
};
