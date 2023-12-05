<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\CollectionVote;
use App\Models\Wallet;
use Carbon\Carbon;

test('collection has many votes', function () {
    $collection = Collection::factory()->create();

    $wallet = Wallet::factory()->create();

    expect($collection->votes()->count())->toBe(0);

    $collection->addVote($wallet);

    expect($collection->votes()->count())->toBe(1);

    $collection->addVote($wallet);

    // Still one vote since the wallet already voted
    expect($collection->votes()->count())->toBe(1);

    $collection->addVote(Wallet::factory()->create());

    expect($collection->votes()->count())->toBe(2);
});

it('filters votes from the current month', function () {

    $collection = Collection::factory()->create();

    CollectionVote::factory()->create([
        'collection_id' => $collection->id,
        'voted_at' => Carbon::now()->startOfMonth(),
    ]);

    $other[] = CollectionVote::factory()->create([
        'collection_id' => $collection->id,
        'voted_at' => Carbon::now()->endOfMonth()->addDay(),
    ])->id;

    CollectionVote::factory()->create([
        'collection_id' => $collection->id,
        'voted_at' => Carbon::now()->startOfMonth()->addDays(15),
    ]);

    $other[] = CollectionVote::factory()->create([
        'collection_id' => $collection->id,
        'voted_at' => Carbon::now()->startOfMonth()->subDay(),
    ])->id;

    expect($collection->votes()->inCurrentMonth()->count())->toBe(2);

    expect($collection->votes()->inCurrentMonth()->whereIn('id', $other)->count())->toBe(0);
});
