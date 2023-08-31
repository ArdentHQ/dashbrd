<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\GalleriesStats;
use App\Models\Gallery;
use App\Models\Nft;

it('creates default stats', function () {

    /** @var GalleriesStats $stats */
    $stats = GalleriesStats::firstOrFail();

    expect($stats->totalGalleries())->toBe(0)
        ->and($stats->totalDistinctUsers())->toBe(0)
        ->and($stats->totalDistinctCollections())->toBe(0)
        ->and($stats->totalDistinctNfts())->toBe(0);
});

it('updates gallery stats', function () {
    $stats = GalleriesStats::firstOrFail();

    $user = createUser();
    expect($stats->fresh()->totalDistinctUsers())->toBe(0);

    $gallery = Gallery::factory()->create([
        'user_id' => $user,
    ]);

    expect($stats->fresh()->totalDistinctUsers())->toBe(1);
    expect($stats->fresh()->totalGalleries())->toBe(1);

    $collection1 = Collection::factory()->create();
    $collection2 = Collection::factory()->create();

    // not associated with a gallery yet
    expect($stats->fresh()->totalDistinctCollections())->toBe(0);

    for ($i = 0; $i < 3; $i++) {
        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet,
            'collection_id' => $collection1,
        ]);

        $gallery->nfts()->attach($nft, ['order_index' => $i]);

        if ($i == 0) {
            expect($stats->fresh()->totalDistinctCollections())->toBe(1);
        } else {
            expect($stats->fresh()->totalDistinctCollections())->toBe(2);
        }

        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet,
            'collection_id' => $collection2,
        ]);

        // not yet associated
        expect($stats->fresh()->totalDistinctNfts())->toBe(1 + $i * 2);

        $gallery->nfts()->attach($nft, ['order_index' => $i]);

        expect($stats->fresh()->totalDistinctCollections())->toBe(2);

        // now associated
        expect($stats->fresh()->totalDistinctNfts())->toBe(2 + $i * 2);
    }
});

it('updates gallery stats on deletion', function () {
    $stats = GalleriesStats::firstOrFail();

    $user = createUser();
    expect($stats->fresh()->totalDistinctUsers())->toBe(0);

    $gallery = Gallery::factory()->create([
        'user_id' => $user,
    ]);

    $collection1 = Collection::factory()->create();
    $collection2 = Collection::factory()->create();

    $nfts = collect();
    for ($i = 0; $i < 3; $i++) {
        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet,
            'collection_id' => $collection1,
        ]);

        $gallery->nfts()->attach($nft, ['order_index' => $i]);

        $nfts->push($nft);

        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet,
            'collection_id' => $collection2,
        ]);
        $nfts->push($nft);

        $gallery->nfts()->attach($nft, ['order_index' => $i]);
    }

    expect($stats->fresh()->totalGalleries())->toBe(1)
        ->and($stats->fresh()->totalDistinctUsers())->toBe(1)
        ->and($stats->fresh()->totalDistinctCollections())->toBe(2)
        ->and($stats->fresh()->totalDistinctNfts())->toBe(6);

    // remove first NFT
    $nfts->first()->delete();

    expect($stats->fresh()->totalGalleries())->toBe(1)
        ->and($stats->fresh()->totalDistinctUsers())->toBe(1)
        // still 2 collections
        ->and($stats->fresh()->totalDistinctCollections())->toBe(2)
        // reduced by 1
        ->and($stats->fresh()->totalDistinctNfts())->toBe(5);

    // delete all nfts in first collection
    Nft::where('collection_id', $collection1->id)->delete();

    expect($stats->fresh()->totalGalleries())->toBe(1)
        ->and($stats->fresh()->totalDistinctUsers())->toBe(1)
        // now only 1 collection remaining
        ->and($stats->fresh()->totalDistinctCollections())->toBe(1)
        // down to 3 from the last collection
        ->and($stats->fresh()->totalDistinctNfts())->toBe(3);

    // delete last collection
    $collection2->nfts()->each(fn ($nft) => $nft->delete());

    // all empty
    expect($stats->fresh()->totalGalleries())->toBe(0)
        ->and($stats->fresh()->totalDistinctUsers())->toBe(0)
        ->and($stats->fresh()->totalDistinctCollections())->toBe(0)
        ->and($stats->fresh()->totalDistinctNfts())->toBe(0);
});

it('updates gallery stats with multiple users', function () {
    $stats = GalleriesStats::firstOrFail();

    $user1 = createUser();
    $user2 = createUser();

    expect($stats->fresh()->totalDistinctUsers())->toBe(0);

    $gallery1 = Gallery::factory()->create([
        'user_id' => $user1,
    ]);

    $gallery2 = Gallery::factory()->create([
        'user_id' => $user2,
    ]);

    expect($stats->fresh()->totalDistinctUsers())->toBe(2);

    $collection1 = Collection::factory()->create();
    $collection2 = Collection::factory()->create();

    $nft = Nft::factory()->create([
        'wallet_id' => $user1->wallet,
        'collection_id' => $collection1,
    ]);
    $gallery1->nfts()->attach($nft, ['order_index' => 0]);

    $nft = Nft::factory()->create([
        'wallet_id' => $user2->wallet,
        'collection_id' => $collection2,
    ]);
    $gallery2->nfts()->attach($nft, ['order_index' => 0]);

    expect($stats->fresh()->totalGalleries())->toBe(2)
        ->and($stats->fresh()->totalDistinctUsers())->toBe(2)
        ->and($stats->fresh()->totalDistinctCollections())->toBe(2)
        ->and($stats->fresh()->totalDistinctNfts())->toBe(2);

    // remove NFT of user 2
    $nft->first()->delete();

    // user 2 is gone
    expect($stats->fresh()->totalGalleries())->toBe(1)
        ->and($stats->fresh()->totalDistinctUsers())->toBe(1)
        ->and($stats->fresh()->totalDistinctCollections())->toBe(1)
        ->and($stats->fresh()->totalDistinctNfts())->toBe(1);
});
