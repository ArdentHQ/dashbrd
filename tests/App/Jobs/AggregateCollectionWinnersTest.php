<?php

declare(strict_types=1);

use App\Jobs\AggregateCollectionWinners;
use App\Models\Collection;
use App\Models\CollectionVote;
use App\Models\CollectionWinner;
use Carbon\Carbon;

function createCollection(int $votes, array $between) {
    $collection = Collection::factory()->create();

    CollectionVote::factory($votes)->for($collection)->create([
        'voted_at' => Carbon::createFromTimestamp(random_int($between[0]->timestamp, $between[1]->timestamp)),
    ]);

    return $collection;
}

it('stores collections that have the most votes', function () {
    Carbon::setTestNow('2023-12-19');

    $previous = now()->subMonth();

    $first = createCollection(votes: 3, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    $third = createCollection(votes: 1, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    $second = createCollection(votes: 2, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    $job = new AggregateCollectionWinners;

    $job->handle();

    expect(CollectionWinner::count())->toBe(3);

    [$a, $b, $c] = CollectionWinner::orderBy('rank', 'asc')->get();

    expect($a->collection->is($first))->toBeTrue();
    expect($a->votes)->toBe(3);
    expect($a->month)->toBe(11);
    expect($a->year)->toBe(2023);

    expect($b->collection->is($second))->toBeTrue();
    expect($b->votes)->toBe(2);
    expect($b->month)->toBe(11);
    expect($b->year)->toBe(2023);

    expect($c->collection->is($third))->toBeTrue();
    expect($c->votes)->toBe(1);
    expect($c->month)->toBe(11);
    expect($c->year)->toBe(2023);
});

it('only keeps 3 winners for the previous month', function () {
    Carbon::setTestNow('2023-12-19');

    $previous = now()->subMonth();

    $existing = CollectionWinner::factory()->create([
        'month' => 11,
        'year' => 2023,
    ]);

    createCollection(votes: 3, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    createCollection(votes: 1, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    createCollection(votes: 2, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    $job = new AggregateCollectionWinners;

    $job->handle();

    expect(CollectionWinner::count())->toBe(3);

    expect($existing->fresh())->toBeNull();
});

it('ignores collections that are not eligible for winning', function () {
    Carbon::setTestNow('2023-12-19');

    // This collection has already won previously...
    $winner = CollectionWinner::factory()->create([
        'month' => 10,
        'year' => 2023,
        'rank' => 1,
    ]);

    $previous = now()->subMonth();

    CollectionVote::factory(50)->for($winner->collection)->create([
        'voted_at' => $previous,
    ]);

    $first = createCollection(votes: 3, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    $third = createCollection(votes: 1, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    $second = createCollection(votes: 2, between: [
        $previous->startOfMonth(), $previous->endOfMonth(),
    ]);

    $job = new AggregateCollectionWinners;

    $job->handle();

    expect(CollectionWinner::count())->toBe(4);
    expect(CollectionWinner::where('month', 11)->count())->toBe(3);

    [$a, $b, $c] = CollectionWinner::where('month', 11)->orderBy('rank', 'asc')->get();

    expect($a->collection->is($first))->toBeTrue();
    expect($a->votes)->toBe(3);
    expect($a->month)->toBe(11);
    expect($a->year)->toBe(2023);

    expect($b->collection->is($second))->toBeTrue();
    expect($b->votes)->toBe(2);
    expect($b->month)->toBe(11);
    expect($b->year)->toBe(2023);

    expect($c->collection->is($third))->toBeTrue();
    expect($c->votes)->toBe(1);
    expect($c->month)->toBe(11);
    expect($c->year)->toBe(2023);
});

it('only counts votes from the previous month', function () {
    Carbon::setTestNow('2023-12-19');

    $previous = now()->subMonth();

    $collection = Collection::factory()->create();

    CollectionVote::factory(3)->for($collection)->create([
        'voted_at' => $previous,
    ]);

    CollectionVote::factory(3)->for($collection)->create([
        'voted_at' => now()->startOfMonth(),
    ]);

    CollectionVote::factory(3)->for($collection)->create([
        'voted_at' => now()->addMonth()->startOfMonth(),
    ]);

    CollectionVote::factory(3)->for($collection)->create([
        'voted_at' => now()->subMonths(2)->endOfMonth(),
    ]);

    $job = new AggregateCollectionWinners;

    $job->handle();

    $winner = CollectionWinner::first();

    expect($winner->collection->is($collection))->toBeTrue();
    expect($winner->votes)->toBe(3);
});

it('has a unique ID', function () {
    $job = new AggregateCollectionWinners;

    expect($job->uniqueId())->toBeString();
});
