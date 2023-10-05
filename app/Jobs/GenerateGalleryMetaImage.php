<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Gallery;
use App\Models\Nft;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\Pool;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Intervention\Image\Facades\Image;

class GenerateGalleryMetaImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public Gallery $gallery)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $images = $this->getImageUrls();

        $responses = Http::pool(fn (Pool $pool) => $images->map(fn ($imageUrl) => $pool->get($imageUrl))->toArray());

        $successfulReponses = array_filter($responses, fn ($response) => $response->ok());

        $image = Image::make(storage_path('meta/gallery_template.png'));

        $mask = Image::make(storage_path('meta/nft_mask.png'));

        foreach ($successfulReponses as $index => $response) {
            $nftImage = Image::make($response->__toString());

            $nftImage
                ->mask($mask)
                ->fit(227, 227);

            $image->insert(
                $nftImage,
                'top-left',
                137 + ($index * (227 + 7)),
                430
            );
        }

        $image->save(storage_path('meta/gallery.png'));
    }

    private function getImageUrls(): Collection
    {
        return $this->gallery->nfts()->get()->map(function (Nft $nft) {
            $images = $nft->images();

            $size = collect(['large', 'small', 'thumb'])->filter(fn ($size) => (bool) $images[$size])->first();

            return $images[$size];
        })->filter()->take(4)->values();
    }
}
