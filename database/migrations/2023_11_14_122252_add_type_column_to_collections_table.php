<?php

declare(strict_types=1);

use App\Enums\TokenType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->string('type')->default(TokenType::Erc721->value);
        });

        DB::table('collections')->update([
            'type' => TokenType::Erc721->value,
        ]);
    }
};
