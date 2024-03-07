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
