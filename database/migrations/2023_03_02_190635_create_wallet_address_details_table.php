<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_address_details', function (Blueprint $table) {
            $table->id();

            $table->caseInsensitiveText('address')->unique();

            $table->text('domain')->unique()->nullable();

            $table->timestamps();
        });

        DB::statement('CREATE INDEX wallet_address_details_domain ON wallet_address_details USING GIN (domain gin_trgm_ops);');
    }
};
