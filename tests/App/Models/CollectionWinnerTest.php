<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\CollectionWinner;

it('can get IDs for collections that are not eligible for winning "collection of the month"', function () {
    $first = CollectionWinner::factory()->create([
        'rank' => 1,
    ]);

    $second = CollectionWinner::factory()->create([
        'rank' => 1,
    ]);

    CollectionWinner::factory()->create([
        'rank' => 2,
    ]);

    Collection::factory()->create();

    $collectionIds = CollectionWinner::ineligibleCollectionIds();

    expect($collectionIds)->toHaveCount(2);
    expect($collectionIds->contains($first->collection_id))->toBeTrue();
    expect($collectionIds->contains($second->collection_id))->toBeTrue();
});

it('can get current "collection of the month" winners', function () {
    $previousMonth = now()->subMonth();

    $first = CollectionWinner::factory()->create([
        'year' => $previousMonth->year,
        'month' => $previousMonth->month,
        'rank' => 1,
    ]);

    $second = CollectionWinner::factory()->create([
        'year' => $previousMonth->year,
        'month' => $previousMonth->month,
        'rank' => 2,
    ]);

    CollectionWinner::factory()->create([
        'year' => $previousMonth->year,
        'month' => $previousMonth->month - 1,
        'rank' => 1,
    ]);

    $winners = CollectionWinner::current();

    expect($winners)->toHaveCount(2);
    expect($winners->contains($first))->toBeTrue();
    expect($winners->contains($second))->toBeTrue();
});
