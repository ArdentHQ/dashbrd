<?php

declare(strict_types=1);

use App\Jobs\CalculateTraitRaritiesForCollection;
use App\Models\Collection;
use App\Models\SpamContract;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections', function () {
    Bus::fake(CalculateTraitRaritiesForCollection::class);

    Collection::factory(3)->create();

    Bus::assertDispatchedTimes(CalculateTraitRaritiesForCollection::class, 0);

    $this->artisan('collections:calculate-trait-rarities');

    Bus::assertDispatchedTimes(CalculateTraitRaritiesForCollection::class, 3);
});

it('can dispatch a job for collections starting from some ID', function () {
    Bus::fake(CalculateTraitRaritiesForCollection::class);

    $id = Collection::factory()->create([
        'supply' => 10,
    ]);

    Collection::factory(5)->create([
        'supply' => 10,
    ]);

    Bus::assertNothingBatched();

    $this->artisan('collections:calculate-trait-rarities --start='.$id);

    Bus::assertBatched(function ($batch) {
        return $batch->jobs->count() === 6;
    });
});

it('can dispatch a job for collections starting from some ID, but limited to specific number', function () {
    Bus::fake(CalculateTraitRaritiesForCollection::class);

    Collection::factory(20)->create();

    Bus::assertNothingBatched();

    $this->artisan('collections:calculate-trait-rarities --start=10 --limit=5');

    Bus::assertBatched(function ($batch) {
        return $batch->jobs->count() === 5;
    });
});

it('should not dispatch a job for a spam collection', function () {
    Bus::fake(CalculateTraitRaritiesForCollection::class);

    $collections = Collection::factory(3)->create();

    SpamContract::query()->insert([
        'address' => $collections->first()->address,
        'network_id' => $collections->first()->network_id,
    ]);

    Bus::assertDispatchedTimes(CalculateTraitRaritiesForCollection::class, 0);

    $this->artisan('collections:calculate-trait-rarities');

    Bus::assertDispatchedTimes(CalculateTraitRaritiesForCollection::class, 2);
});

it('dispatches a job for a specific collection', function () {
    Bus::fake(CalculateTraitRaritiesForCollection::class);

    $collection = Collection::factory()->create();

    Bus::assertDispatchedTimes(CalculateTraitRaritiesForCollection::class, 0);

    $this->artisan('collections:calculate-trait-rarities', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(CalculateTraitRaritiesForCollection::class, 1);
});

it('should not dispatch a job for a given spam collection', function () {
    Bus::fake(CalculateTraitRaritiesForCollection::class);

    $collection = Collection::factory()->create();

    SpamContract::query()->insert([
        'address' => $collection->address,
        'network_id' => $collection->network_id,
    ]);

    Bus::assertDispatchedTimes(CalculateTraitRaritiesForCollection::class, 0);

    $this->artisan('collections:calculate-trait-rarities', [
        '--collection-id' => $collection->id,
    ]);

    Bus::assertDispatchedTimes(CalculateTraitRaritiesForCollection::class, 0);
});
