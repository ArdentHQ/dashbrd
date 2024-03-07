<?php

declare(strict_types=1);

use App\Jobs\CalculateTraitRaritiesForCollection;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Models\Network;
use App\Models\SpamContract;
use Illuminate\Support\Facades\Bus;

it('should dispatch batches for the collection', function () {
    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'supply' => 10,
    ]);

    CollectionTrait::factory(5)->create([
        'collection_id' => $collection->id,
    ]);

    (new CalculateTraitRaritiesForCollection($collection))->handle();

    Bus::assertBatched(function ($batch) {
        return $batch->jobs->count() === 1;
    });
});

it('does not run for collections without supply', function () {
    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'supply' => null,
    ]);

    CollectionTrait::factory(5)->create([
        'collection_id' => $collection->id,
    ]);

    (new CalculateTraitRaritiesForCollection($collection))->handle();

    Bus::assertNothingBatched();
});

it('does not run for collections with too big of a supply', function () {
    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'supply' => 100000,
    ]);

    CollectionTrait::factory(5)->create([
        'collection_id' => $collection->id,
    ]);

    (new CalculateTraitRaritiesForCollection($collection))->handle();

    Bus::assertNothingBatched();
});

it('does not run for spam collections', function () {
    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'supply' => 10,
    ]);

    SpamContract::create([
        'network_id' => $network->id,
        'address' => $collection->address,
    ]);

    CollectionTrait::factory(5)->create([
        'collection_id' => $collection->id,
    ]);

    (new CalculateTraitRaritiesForCollection($collection))->handle();

    Bus::assertNothingBatched();
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new CalculateTraitRaritiesForCollection($collection))->uniqueId())->toBeString();
});
