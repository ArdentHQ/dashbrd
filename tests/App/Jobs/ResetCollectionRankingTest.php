<?php

declare(strict_types=1);

use App\Jobs\ResetCollectionRanking;
use App\Models\Collection;
use App\Models\CollectionVote;
use Carbon\Carbon;

it('stores collections that have the most votes', function () {
    $collection = Collection::factory()->create();
    $collection2 = Collection::factory()->create();
    $collection3 = Collection::factory()->create();

    CollectionVote::factory(2)->for($collection)->create([
        'voted_at' => Carbon::now(),
    ]);
    CollectionVote::factory(2)->for($collection)->create([
        'voted_at' => Carbon::now()->subMonths(2),
    ]);

    CollectionVote::factory(3)->for($collection3)->create([
        'voted_at' => Carbon::now(),
    ]);

    expect(Collection::pluck('monthly_votes')->toArray())->toEqual([null, null, null]);
    expect(Collection::pluck('monthly_rank')->toArray())->toEqual([null, null, null]);

    ResetCollectionRanking::dispatch();

    $collection->refresh();
    $collection2->refresh();
    $collection3->refresh();

    expect($collection->monthly_votes)->toBe(2);
    expect($collection->monthly_rank)->toBe(2);

    expect($collection2->monthly_votes)->toBe(0);
    expect($collection2->monthly_rank)->toBe(3);

    expect($collection3->monthly_votes)->toBe(3);
    expect($collection3->monthly_rank)->toBe(1);
});

it('has unique ID', function () {
    $job = new ResetCollectionRanking;

    expect($job->uniqueId())->toBeString();
});
