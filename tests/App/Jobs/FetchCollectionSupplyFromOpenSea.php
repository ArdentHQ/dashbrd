<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionSupplyFromOpenSea;
use App\Models\Collection;
use App\Support\Facades\Opensea;

it('updates the supply for a collection', function () {
    Opensea::shouldReceive('getCollectionSupply')
                ->with('test-slug')
                ->andReturn(1000);

    $collection = Collection::factory()->create([
        'supply' => null,
        'extra_attributes' => [
            'opensea_slug' => 'test-slug',
        ],
    ]);

    (new FetchCollectionSupplyFromOpenSea($collection))->handle();

    expect($collection->fresh()->supply)->toBe(1000);
});

it('does not run for collections that already have supply', function () {
    Opensea::shouldReceive('getCollectionSupply')->never();

    $collection = Collection::factory()->create([
        'supply' => 1000,
        'extra_attributes' => [
            'opensea_slug' => 'test-slug',
        ],
    ]);

    (new FetchCollectionSupplyFromOpenSea($collection))->handle();

    expect($collection->fresh()->supply)->toBe(1000);
});

it('does not run for collections that do not have a OpenSea slug', function () {
    Opensea::shouldReceive('getCollectionSupply')->never();

    $collection = Collection::factory()->create([
        'supply' => null,
        'extra_attributes' => [
            'opensea_slug' => null,
        ],
    ]);

    (new FetchCollectionSupplyFromOpenSea($collection))->handle();

    expect($collection->fresh()->supply)->toBeNull();
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionSupplyFromOpenSea($collection))->uniqueId())->toBeString();
});
