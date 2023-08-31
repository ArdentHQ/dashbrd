<?php

declare(strict_types=1);

use App\Models\Gallery;
use App\Models\Nft;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nft_gallery', function (Blueprint $table) {
            $table->foreignIdFor(Nft::class)->index()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Gallery::class)->index()->constrained()->cascadeOnDelete();
            $table->integer('order_index');
        });
    }
};
