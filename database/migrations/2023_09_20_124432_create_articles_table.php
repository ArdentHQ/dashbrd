<?php

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
            $table->string('category');
            $table->date('date')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('content');
            $table->foreignIdFor(User::class)->index()->constrained()->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }
};
