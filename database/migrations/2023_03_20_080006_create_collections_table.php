<?php

declare(strict_types=1);

use App\Models\Network;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->caseInsensitiveText('address');
            $table->foreignIdFor(Network::class)->constrained()->cascadeOnDelete();

            $table->text('name');
            $table->string('slug');
            $table->string('symbol');
            $table->text('description')->nullable();
            $table->integer('supply')->nullable();
            $table->integer('owners')->nullable();
            $table->string('volume')->nullable();

            $table->addColumn('numeric', 'floor_price', ['numeric_type' => 'numeric'])->nullable();
            $table->foreignId('floor_price_token_id')->nullable()->references('id')->on('tokens')->cascadeOnDelete();
            $table->timestamp('floor_price_retrieved_at')->nullable(); // when the price was last updated as reported by the 3rd party APIs

            $table->jsonb('fiat_value')->default('{}');

            $table->schemalessAttributes('extra_attributes');
            $table->unsignedBigInteger('minted_block');
            $table->timestamp('minted_at')->nullable();
            $table->addColumn('numeric', 'last_indexed_token_number', ['numeric_type' => 'numeric'])->nullable();

            $table->timestamps();

            $table->softDeletes();
            $table->unique(['address', 'network_id']);

            $table->index(['network_id', 'minted_block']);
        });

        DB::statement('CREATE INDEX collections_name ON collections USING GIN (name gin_trgm_ops)');
    }
};
