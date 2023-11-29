<?php

declare(strict_types=1);

use App\Enums\TokenType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Collection;
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

        $eth = $this->erc1155Addresses('eth');
        $polygon = $this->erc1155Addresses('polygon');

        DB::table('collections')->where(function ($q) use ($polygon) {
            return $q->whereIn('address', $polygon)->where('network_id', 1);
        })->orWhere(function ($q) use ($eth) {
            return $q->whereIn('address', $eth)->where('network_id', 3);
        })->update([
            'type' => TokenType::Erc1155,
        ]);
    }

    /**
     * @return Collection<int, string>
     */
    private function erc1155Addresses(string $network): Collection
    {
        $contents = file_get_contents(database_path('seeders/fixtures/live-dump/collection-nfts/top-'.$network.'-collections.json'));

        return collect(json_decode($contents, true)['data'])
                ->filter(fn ($collection) => $collection['erc_type'] === 'erc1155')
                ->pluck('contract_address');
    }
};
