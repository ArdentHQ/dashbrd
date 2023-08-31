<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Collection as CollectionModel;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        $wallet = $this->wallet();

        $galleries = [
            [
                'name' => 'My Own Collection',
                'image' => 'https://i.seadn.io/gae/U1sLbA_CZuxvfdm7TuoE66j96v_msciXYYW0IMrvyhGd_aPajppTyezp2WUM7Jvpj4PI4Icj5s9HJr02D7xhvoIz4FVMn_RIv_7L?auto=format&w=3840',
                'count' => 4,
            ],
            [
                'name' => 'My Own Collection - Improved',
                'image' => null,
                'count' => 10,
            ],
            [
                'name' => 'I Like Cats',
                'image' => 'https://i.seadn.io/gcs/files/ce79bded2f387e9bbb8153da5a5750f0.png?auto=format&w=3840',
                'count' => 6,
            ],
            [
                'name' => 'I Like Dogs',
                'image' => 'https://i.seadn.io/gcs/files/8a4964b89fb3541a7da121482f8d64e7.png?auto=format&w=3840',
                'count' => 8,
            ],
            [
                'name' => 'Teeny Tiny Collection',
                'image' => null,
                'count' => 1,
            ],
            [
                'name' => 'I do not know what to call this collection sooooooo',
                'image' => null,
                'count' => 3,
            ],

            [
                'name' => 'Big Collection TM',
                'image' => null,
                'count' => 16,
            ],

            [
                'name' => 'Mixed Collection',
                'image' => null,
                'collectionsCount' => 16,
            ],
            ...collect(range(1, 11))->map(fn ($collectionsCount) => [
                'name' => sprintf('Gallery with %d different collections', $collectionsCount),
                'image' => null,
                'collectionsCount' => $collectionsCount,
            ])->toArray(),
        ];

        foreach ($galleries as $galleryDetails) {

            $gallery = Gallery::create([
                'user_id' => $wallet->user->id,
                'name' => $galleryDetails['name'],
                'cover_image' => $galleryDetails['image'],
                'created_at' => fake()->dateTimeBetween('-2 months'),
            ]);

            DB::table('views')->insert(Collection::times(random_int(100, 1500))->map(fn () => $this->createView($gallery))->toArray());

            // Attach NFTs to gallery
            if (array_key_exists('collectionsCount', $galleryDetails)) {
                $collections = CollectionModel::inRandomOrder()->has('nfts')->limit($galleryDetails['collectionsCount'])->pluck('id');
                $nfts = Nft::distinct('collection_id')->whereIn('collection_id', $collections)->get();
            } else {
                $nfts = Nft::inRandomOrder()->limit($galleryDetails['count'])->get();
            }

            $nfts->each(function (Nft $nft, int $index) use ($gallery) {
                $gallery->nfts()->attach($nft->id, ['order_index' => $index]);
            });
        }

        Gallery::updateValues();
    }

    // Currently we only create 1 full user
    private function wallet(): Wallet
    {
        return Wallet::firstWhere('address', env('LOCAL_TESTING_ADDRESS'));
    }

    private function createView(Gallery $gallery): array
    {
        return [
            'viewable_id' => $gallery->getKey(),
            'viewable_type' => $gallery->getMorphClass(),
            'visitor' => Str::random(),
            'collection' => null,
            'viewed_at' => now(),
        ];
    }
}
