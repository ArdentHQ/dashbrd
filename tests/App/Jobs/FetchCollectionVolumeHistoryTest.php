<?php

declare(strict_types=1);

use App\Data\Web3\Web3Volume;
use App\Jobs\FetchCollectionVolumeHistory;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;

it('should fetch 30-day volume history for the collection', function () {
    Mnemonic::shouldReceive('getCollectionVolumeHistory')->andReturn(collect([
        new Web3Volume(value: '1', date: today()),
        new Web3Volume(value: '2', date: today()->subDay()),
    ]));

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'volume_1d' => '1',
        'volume_7d' => '2',
        'volume_30d' => '3',
    ]);

    (new FetchCollectionVolumeHistory($collection))->handle();

    $collection->refresh();

    expect($collection->volume_1d)->toBe('1');
    expect($collection->volume_7d)->toBe('3');
    expect($collection->volume_30d)->toBe('3');
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolumeHistory($collection))->uniqueId())->toBeString();
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolumeHistory($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});
