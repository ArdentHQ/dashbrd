<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionTotalVolume;
use App\Models\Collection;
use App\Support\Facades\Opensea;

it('should fetch total volume for the collection', function () {
    Opensea::shouldReceive('getCollectionTotalVolume')->andReturn(753);

    $collection = Collection::factory()->create([
        'total_volume' => "254",
    ]);

    (new FetchCollectionTotalVolume($collection))->handle();

    expect($collection->fresh()->total_volume)->toBe("753");
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionTotalVolume($collection))->uniqueId())->toBeString();
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionTotalVolume($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});
