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
        Schema::create('token_guids', function (Blueprint $table) {
            $table->id();
            $table->string('guid', 64)->index();

            $table->foreignIdFor(Network::class)->index()->constrained()->cascadeOnDelete();
            $table->caseInsensitiveText('address');

            $table->unique(['guid', 'network_id', 'address']);
        });
    }
};
