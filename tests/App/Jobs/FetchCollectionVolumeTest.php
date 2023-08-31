<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionVolume;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;
use Illuminate\Support\Facades\Http;

it('should fetch nft collection volume', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/sales_volume/DURATION_1_DAY/GROUP_BY_PERIOD_1_DAY' => Http::response([
            'dataPoints' => [
                ['volume' => '12.3'],
            ],
        ], 200),
    ]);

    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'volume' => null,
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect($collection->volume)->toBeNull();

    (new FetchCollectionVolume($collection))->handle();

    $collection->refresh();

    expect($collection->volume)->toBe('12300000000000000000');
});

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionVolume($collection))->retryUntil())->toBeInstanceOf(DateTime::class);
});
