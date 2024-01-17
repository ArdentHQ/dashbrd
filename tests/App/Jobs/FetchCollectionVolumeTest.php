<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionVolume;
use App\Models\Collection;
use App\Models\Network;
use App\Models\TradingVolume;
use App\Support\Facades\Mnemonic;
use Illuminate\Support\Facades\Http;

it('should fetch nft collection volume', function () {
    Mnemonic::shouldReceive('getNftCollectionVolume')->andReturn('10');

    $collection = Collection::factory()->for(Network::polygon())->create([
        'volume' => null,
    ]);

    expect($collection->volume)->toBeNull();

    (new FetchCollectionVolume($collection))->handle();

    expect($collection->fresh()->volume)->toBe('10');
});

it('logs volume changes', function () {
    Mnemonic::fake([
        '*' => Http::response([
            'dataPoints' => [[
                'volume' => '12.3',
            ]],
        ], 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->for($network)->create([
        'volume' => '11000000000000000000',
    ]);

    TradingVolume::factory()->for($collection)->create([
        'volume' => '11000000000000000000',
        'created_at' => now()->subHours(10),
    ]);

    (new FetchCollectionVolume($collection))->handle();

    $collection->refresh();

    expect($collection->volumes()->count())->toBe(2);
    expect($collection->volumes()->oldest('id')->pluck('volume')->toArray())->toBe(['11000000000000000000', '12300000000000000000']);
    expect($collection->avg_volume_1d)->toBe('11650000000000000000');
    expect($collection->avg_volume_7d)->toBe('11650000000000000000');
    expect($collection->avg_volume_30d)->toBe('11650000000000000000');
});

it('does not log volume changes if there is no volume', function () {
    Mnemonic::shouldReceive('getNftCollectionVolume')->andReturn(null);

    $collection = Collection::factory()->for(Network::polygon())->create([
        'volume' => '10',
    ]);

    (new FetchCollectionVolume($collection))->handle();

    $collection->refresh();

    expect(TradingVolume::count())->toBe(0);
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolume($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});

it('has a unique ID', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolume($collection))->uniqueId())->toBe(FetchCollectionVolume::class.':'.$collection->id);
});
