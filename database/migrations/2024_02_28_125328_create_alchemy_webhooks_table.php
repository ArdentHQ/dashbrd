<?php

declare(strict_types=1);

use App\Models\Network;
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
        Schema::create('alchemy_webhooks', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Network::class)->constrained()->cascadeOnDelete();
            $table->string('provider_id');
            $table->string('url');
            $table->string('type');
            $table->string('checksum');
            $table->mediumText('addresses');
            $table->timestamps();
        });
    }
};
