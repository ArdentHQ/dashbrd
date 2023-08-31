<?php

declare(strict_types=1);

use App\Models\Collection;
use Illuminate\Database\Grammar;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Fluent;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared(get_query('migrations.create_trait_display_type_enum'));

        Grammar::macro('typeTrait_display_type_enum', function (Fluent $column) {
            return $column->get('trait_display_type_enum');
        });

        Schema::create('collection_traits', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(Collection::class)->index()->constrained()->cascadeOnDelete();
            $table->text('name');
            // the `value` column is only for indexing purposes and to uniquely identify a trait that is shared between nfts.
            // do not use directly since type information might be lost. it is preferred to read the `value_string/value_numeric/value_date`
            // columns from the `nft_trait` pivot table based on `display_type`.
            // for numeric trait this value is always a placeholder (found in Web3NftHandler.php)
            $table->text('value');

            $table->addColumn('trait_display_type_enum', 'display_type', ['trait_display_type_enum' => 'trait_display_type_enum'])->default('DISPLAY_TYPE_PROPERTY');

            // only present for some numeric display types (e.g. STAT/LEVEL) - represents the lower and upper bound
            // across all nfts that have this trait. useful for the UI.
            $table->float('value_min')->nullable();
            $table->float('value_max')->nullable();

            $table->bigInteger('nfts_count');
            $table->float('nfts_percentage');
            $table->timestamps();

            $table->unique(['collection_id', 'name', 'value']);
        });
    }
};
