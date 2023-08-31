<?php

declare(strict_types=1);

use App\Models\Token;
use App\Models\Wallet;
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

        Schema::create('balances', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Wallet::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Token::class)->constrained()->cascadeOnDelete();
            // Stores WEI (10^18)
            $table->addColumn('numeric', 'balance', ['numeric_type' => 'numeric'])->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['wallet_id', 'token_id']);
        });
    }
};
