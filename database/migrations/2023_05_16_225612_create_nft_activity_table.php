<?php

declare(strict_types=1);

use App\Models\Nft;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nft_activity', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Nft::class);
            $table->string('type');
            $table->string('sender');
            $table->string('recipient');
            $table->addColumn('numeric', 'total_native', ['numeric_type' => 'numeric'])->nullable();
            $table->addColumn('numeric', 'total_usd', ['numeric_type' => 'numeric'])->nullable();
            $table->string('tx_hash');
            $table->jsonb('extra_attributes');

            $table->timestamp('timestamp');
            $table->timestamps();

            $table->unique(['tx_hash', 'nft_id', 'type']);
            $table->index([
                'nft_id', 'type', 'timestamp desc',
            ]);
        });
    }
};
