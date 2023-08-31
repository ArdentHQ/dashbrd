<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('networks', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->integer('chain_id')->unique();
            $table->boolean('is_mainnet')->default(false);
            $table->string('public_rpc_provider');
            $table->string('explorer_url');
            $table->timestamps();
        });
    }
};
