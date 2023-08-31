<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->caseInsensitiveText('address');
            $table->float('total_usd')->default(0);
            $table->schemalessAttributes('extra_attributes');
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('onboarded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['address']);
        });
    }
};
