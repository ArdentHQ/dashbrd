<?php

declare(strict_types=1);

use App\Models\Token;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coingecko_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('coingecko_id')->unique();
            $table->text('name');
            $table->caseInsensitiveText('symbol')->index();
            $table->jsonb('platforms')->index();
            $table->boolean('duplicated')->default(false);
            $table->timestamps();

            $table->foreignIdFor(Token::class)->nullable()->constrained()->cascadeOnDelete();

            $table->softDeletes();
        });

        DB::statement('CREATE INDEX coingecko_tokens_name ON coingecko_tokens USING GIN (name gin_trgm_ops)');
    }
};
