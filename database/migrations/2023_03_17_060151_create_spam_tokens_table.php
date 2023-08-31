<?php

declare(strict_types=1);

use App\Models\Token;
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
        Schema::create('spam_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Token::class)->constrained()->cascadeOnDelete();
            $table->text('reason');
            $table->timestamps();

            $table->unique(['token_id']);
        });
    }
};
