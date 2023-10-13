<?php

declare(strict_types=1);

use App\Models\Collection;
use Illuminate\Database\Grammar;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Fluent;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Grammar::macro('typeNumeric', function (Fluent $column) {
            return $column->get('numeric_type');
        });

        Schema::table('nft_activity', function (Blueprint $table) {
            $table->foreignIdFor(Collection::class)->nullable()->constrained()->cascadeOnDelete()->after('id');
            $table->addColumn('numeric', 'token_number', ['numeric_type' => 'numeric'])->after('collection_id')->nullable();
            $table->addColumn('numeric', 'log_index', ['numeric_type' => 'numeric'])->after('tx_hash')->nullable();

            $table->dropColumn('nft_id');

            $table->unique(['tx_hash', 'log_index', 'collection_id', 'token_number', 'type']);

            $table->index(['collection_id', 'timestamp']);
        });
    }
};
