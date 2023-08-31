<?php

declare(strict_types=1);

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
        Schema::create('token_price_history', function (Blueprint $table) {
            $table->id();
            $table->string('token_guid')->index();
            $table->caseInsensitiveText('currency'); // usd, eur, ...
            $table->addColumn('numeric', 'price', ['numeric_type' => 'numeric'])->default(0);
            $table->timestamp('timestamp');

            $table->unique(['token_guid', 'currency', 'timestamp']);
        });
    }
};
