<?php

declare(strict_types=1);

use App\Models\Article;
use App\Models\Collection;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_collection', function (Blueprint $table) {
            $table->foreignIdFor(Article::class)->index()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Collection::class)->index()->constrained()->cascadeOnDelete();
            $table->integer('order_index');
        });
    }
};
