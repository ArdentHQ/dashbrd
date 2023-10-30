<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpKernel\Log\Logger;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        DB::table('nfts')->get()->each(function ($nft) {
            $extraAttributes = json_decode($nft->extra_attributes);

            $previousThumb = $extraAttributes->images->thumb;
            $previousSmall = $extraAttributes->images->small;
            $previousLarge = $extraAttributes->images->large;

            $extraAttributes->images->thumb = $this->replaceThumbnailsWithScaled($extraAttributes->images->thumb);
            $extraAttributes->images->small = $this->replaceThumbnailsWithScaled($extraAttributes->images->small);
            $extraAttributes->images->large = $this->replaceThumbnailsWithScaled($extraAttributes->images->large);

            if($previousThumb !== $extraAttributes->images->thumb || $previousSmall !== $extraAttributes->images->small || $previousLarge !== $extraAttributes->images->large) {
                DB::table('nfts')
                    ->where('id', $nft->id)
                    ->update(['extra_attributes' => json_encode($extraAttributes)]);
            }

        });
    }

    public function replaceThumbnailsWithScaled(string $url): string
    {
        return preg_replace('/thumbnailv2/', 'scaled', $url);
    }
};
