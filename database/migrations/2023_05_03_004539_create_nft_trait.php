<?php

declare(strict_types=1);

use App\Models\Nft;
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
        Schema::create('nft_trait', function (Blueprint $table) {
            $table->foreignIdFor(Nft::class)->index()->constrained()->cascadeOnDelete();
            $table->bigInteger('trait_id')->index();

            $table->foreign('trait_id')->references('id')->on('collection_traits')->constrained()->cascadeOnDelete();

            // The trait value can be thought of as a union where only one of the below
            // columns is populated depending on the trait display type. This more or less mirrors
            // what the Mnemonic API gives us and is for efficiency reasons like this since we are dealing
            // with a lot of data (rows) here.
            //
            // The application (i.e. PHP) is responsible for taking into account the adequate
            // column when searching/filtering NFTs based on trait values.
            //
            $table->text('value_string')->nullable();
            $table->addColumn('numeric', 'value_numeric', ['numeric_type' => 'numeric'])->nullable();
            $table->timestamp('value_date')->nullable();

            $table->index(['trait_id', 'value_string']);
            $table->index(['trait_id', 'value_numeric']);
            $table->index(['trait_id', 'value_date']);

            $table->unique(['nft_id', 'trait_id']);
        });
    }
};
