<?php

declare(strict_types=1);

use App\Jobs\CalculateTraitRarities;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Nft;
use Carbon\Carbon;

it('calculates the rarity for a collection', function () {
    Carbon::setTestNow('2020-03-14 13:29:00');

    $collection = Collection::factory()->create([
        'supply' => 2,
    ]);

    $trait1 = CollectionTrait::factory()->create([
        'name' => 'Background',
        'value' => 'Blue',
    ]);

    $nft = Nft::factory()->for($collection)->create();

    $nft->traits()->attach($trait1);

    $otherNft = Nft::factory()->for($collection)->create();

    $otherNft->traits()->attach($trait1);

    $trait2 = CollectionTrait::factory()->create([
        'name' => 'Background',
        'value' => 'Red',
    ]);

    $otherNft->traits()->attach($trait2);

    $trait3 = CollectionTrait::factory()->create([
        'name' => 'Foreground',
        'value' => 'Black',
    ]);

    $nft->traits()->attach($trait3);

    // We'll assert that it updated the `updated_at` timestamp for a trait...
    expect($trait1->updated_at->toDateTimeString())->toBe('2020-03-14 13:29:00');
    expect($trait2->updated_at->toDateTimeString())->toBe('2020-03-14 13:29:00');
    expect($trait3->updated_at->toDateTimeString())->toBe('2020-03-14 13:29:00');

    (new CalculateTraitRarities($collection, collect([
        $trait1,
        $trait2,
        $trait3,
    ])))->handle();

    $trait1->refresh();
    $trait2->refresh();
    $trait3->refresh();

    expect($trait1->nfts_percentage)->toBe(100.0);
    expect($trait1->updated_at->toDateTimeString())->not->toBe('2020-03-14 13:29:00');

    expect($trait2->nfts_percentage)->toBe(50.0);
    expect($trait2->updated_at->toDateTimeString())->not->toBe('2020-03-14 13:29:00');

    expect($trait3->nfts_percentage)->toBe(50.0);
    expect($trait3->updated_at->toDateTimeString())->not->toBe('2020-03-14 13:29:00');
});
