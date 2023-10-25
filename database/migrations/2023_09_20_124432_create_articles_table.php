<?php

declare(strict_types=1);

use App\Models\User;
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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category');
            $table->timestamp('published_at')->nullable()->index();
            $table->text('meta_description')->nullable();
            $table->text('content');
            $table->string('audio_file_url')->nullable();
            $table->unsignedInteger('views_count_7days')->default(0);
            $table->foreignIdFor(User::class)->index()->constrained()->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }
};
