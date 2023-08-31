<?php

declare(strict_types=1);

use App\Models\Network;
use App\Models\TokenGuid;
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
        Schema::create('tokens', function (Blueprint $table) {
            $table->id();
            $table->caseInsensitiveText('address');
            $table->foreignIdFor(Network::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(TokenGuid::class, 'token_guid')->nullable()->index();
            $table->boolean('is_native_token')->default(false);
            $table->boolean('is_default_token')->default(false)->index();
            $table->string('name')->index();
            $table->caseInsensitiveText('symbol')->index();
            $table->integer('decimals')->default(18);
            $table->schemalessAttributes('extra_attributes'); // TODO: use jsonb instead of json
            $table->timestamps();

            $table->unique(['address', 'network_id']);
        });
    }
};
