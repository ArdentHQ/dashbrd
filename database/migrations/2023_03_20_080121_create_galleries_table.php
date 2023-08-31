<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->index()->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('cover_image')->nullable();
            $table->jsonb('value')->default('{}');
            $table->unsignedBigInteger('score')->default('0');
            $table->timestamps();
        });

        DB::statement('CREATE INDEX galleries_name ON galleries USING GIN (name gin_trgm_ops)');
    }
};
