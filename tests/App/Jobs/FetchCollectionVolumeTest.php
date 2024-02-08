<?php

declare(strict_types=1);

use App\Data\Web3\Web3Volume;
use App\Jobs\FetchCollectionVolume;
use App\Models\Collection;
use App\Models\Network;
use App\Models\TradingVolume;
use App\Support\Facades\Mnemonic;

it('should retrieve the latest collection volume', function () {
    Mnemonic::shouldReceive('getLatestCollectionVolume')->andReturn(new Web3Volume(
        value: '123',
        date: now(),
    ));

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'volume' => null,
    ]);

    TradingVolume::factory()->for($collection)->create([
        'volume' => '10',
        'created_at' => now()->subDays(3),
    ]);

    expect($collection->volume)->toBeNull();

    (new FetchCollectionVolume($collection))->handle();

    expect($collection->fresh()->volume)->toBe('123');
    expect(TradingVolume::count())->toBe(2);

    $volume = TradingVolume::latest('id')->first();

    expect($volume->volume)->toBe('123');
    expect($volume->created_at->toDateString())->toBe(today()->toDateString());
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolume($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolume($collection))->uniqueId())->toBe(FetchCollectionVolume::class.':'.$collection->id);
});
