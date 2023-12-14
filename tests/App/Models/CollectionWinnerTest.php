<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\CollectionWinner;

it('can get IDs for collections that are not eligible for winning "collection of the month"', function () {
    $first = CollectionWinner::factory()->create();
    $second = CollectionWinner::factory()->create();

    Collection::factory()->create();

    $collectionIds = CollectionWinner::ineligibleCollectionIds();

    expect($collectionIds)->toHaveCount(2);
    expect($collectionIds->contains($first->id))->toBeTrue();
    expect($collectionIds->contains($second->id))->toBeTrue();
});

it('can get current "collection of the month" winners', function () {
    $previousMonth = now()->subMonth();

    $first = CollectionWinner::factory()->create([
        'year' => $previousMonth->year,
        'month' => $previousMonth->month,
    ]);

    $second = CollectionWinner::factory()->create([
        'year' => $previousMonth->year,
        'month' => $previousMonth->month,
    ]);

    CollectionWinner::factory()->create([
        'year' => $previousMonth->year,
        'month' => $previousMonth->month - 1,
    ]);

    $winners = CollectionWinner::current();

    expect($winners)->toHaveCount(2);
    expect($winners->contains($first))->toBeTrue();
    expect($winners->contains($second))->toBeTrue();
});
