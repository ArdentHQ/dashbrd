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
        Schema::create('nfts', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Wallet::class)->nullable()->index()->constrained()->nullOnDelete();
            $table->foreignIdFor(Collection::class)->index()->constrained()->cascadeOnDelete();

            $table->addColumn('numeric', 'token_number', ['numeric_type' => 'numeric']);

            $table->text('name')->nullable();
            $table->schemalessAttributes('extra_attributes');

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['collection_id', 'token_number']);
        });
    }
};
