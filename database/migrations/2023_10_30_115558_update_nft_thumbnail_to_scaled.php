<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('nfts')
            ->whereRaw("extra_attributes->'images'->>'thumb' LIKE '%thumbnailv2%'")
            ->orWhereRaw("extra_attributes->'images'->>'small' LIKE '%thumbnailv2%'")
            ->orWhereRaw("extra_attributes->'images'->>'large' LIKE '%thumbnailv2%'")->get()->each(function ($nft) {
                $extraAttributes = json_decode($nft->extra_attributes);

                $extraAttributes->images->thumb = $this->replaceThumbnailsWithScaled($extraAttributes->images->thumb);
                $extraAttributes->images->small = $this->replaceThumbnailsWithScaled($extraAttributes->images->small);
                $extraAttributes->images->large = $this->replaceThumbnailsWithScaled($extraAttributes->images->large);

                DB::table('nfts')
                    ->where('id', $nft->id)
                    ->update(['extra_attributes' => json_encode($extraAttributes)]);

            });
    }

    public function replaceThumbnailsWithScaled(string $url): string
    {
        return preg_replace('/thumbnailv2/', 'scaled', $url);
    }
};
