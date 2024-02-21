<?php

declare(strict_types=1);

use App\Jobs\CalculateTraitRarities;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Nft;

it('calculates the rarity for a collection', function () {
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

    (new CalculateTraitRarities($collection, collect([
        $trait1,
        $trait2,
        $trait3,
    ])))->handle();

    $trait1->refresh();
    $trait2->refresh();
    $trait3->refresh();

    expect($trait1->nfts_percentage)->toBe(1.0);
    expect($trait2->nfts_percentage)->toBe(0.5);
    expect($trait3->nfts_percentage)->toBe(0.5);
});
