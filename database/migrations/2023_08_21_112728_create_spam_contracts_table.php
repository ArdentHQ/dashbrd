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
        Schema::create('spam_contracts', function (Blueprint $table) {
            $table->id();
            $table->caseInsensitiveText('address');
            $table->foreignId('network_id');
            $table->timestamps();

            $table->unique(['network_id', 'address']);
        });
    }
};
