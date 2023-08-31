<?php

declare(strict_types=1);

use App\Models\TokenGuid;
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
        Schema::create('token_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(TokenGuid::class, 'token_guid')->index()->constrained()->cascadeOnDelete();
            $table->caseInsensitiveText('currency')->index(); // usd, eur, ...
            $table->addColumn('numeric', 'price', ['numeric_type' => 'numeric'])->default(0);
            $table->float('price_change_24h')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['token_guid', 'currency']);
        });
    }
};
