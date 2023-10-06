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

        $image
            ->text($this->gallery->name, 600, 342, function ($font) {
                $font->file(resource_path('fonts/Ubuntu-Medium.ttf'));
                $font->color('#31333F');
                $font->size(21);
                $font->align('center');
                $font->valign('middle');
            })
            ->save(storage_path('meta/gallery.png'));

        $nftsCount = (string) $this->gallery->nfts()->count();
        $collectionsCount = (string) 3;

        $label = '%s NFTs from %s collections';
        $numbers = '%s           %s            ';

        $image
            ->text(sprintf(
                $label,
                str_repeat(' ', strlen($nftsCount)),
                str_repeat(' ', strlen($collectionsCount))
            ), 600, 371, function ($font) {
                $font->file(resource_path('fonts/Ubuntu-Medium.ttf'));
                // $font->color('#31333F');
                $font->color('#FF0000');
                $font->size(14);
                $font->align('center');
                $font->valign('middle');
            })
            ->save(storage_path('meta/gallery.png'));

        $image
            ->text(sprintf($numbers, $nftsCount, $collectionsCount), 600, 371, function ($font) {
                $font->file(resource_path('fonts/Ubuntu-Medium.ttf'));
                // $font->color('#31333F');
                $font->color('#0000FF');
                $font->size(14);
                $font->align('center');
                $font->valign('middle');
            })
            ->save(storage_path('meta/gallery.png'));
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
