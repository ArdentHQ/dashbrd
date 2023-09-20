<?php

declare(strict_types=1);

use App\Jobs\DetermineCollectionMintingDate;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Alchemy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

it('updates the collection date based on previously indexed dates', function () {
    DB::table('networks')->delete();

    $network = Network::factory()->create([
        'chain_id' => 137,
    ]);

    $time = now()->subDays(10);

    Collection::factory()->create([
        'network_id' => $network->id,
        'minted_block' => 1000,
        'minted_at' => $time,
    ]);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => 'dummy-address',
        'minted_block' => 1000,
        'minted_at' => null,
    ]);

    $job = new DetermineCollectionMintingDate($collection);

    $job->handle();

    expect($collection->fresh()->minted_at->timestamp)->toBe($time->timestamp);
});

it('retrieves the minted date from the web3 provider if not previously retrieved', function () {
    Alchemy::fake([
        '*' => Http::response(fixtureData('alchemy.block_data'), 200),
    ]);

    $network = Network::polygon();

    Collection::factory()->create([
        'network_id' => $network->id,
        'minted_block' => 1000,
        'minted_at' => null,
    ]);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => 'dummy-address',
        'minted_block' => 1000,
        'minted_at' => null,
    ]);

    $job = new DetermineCollectionMintingDate($collection);

    $job->handle();

    expect($collection->fresh()->minted_at->timestamp)->toBe(100000000);
});

it('has a middleware', function () {
    $job = new DetermineCollectionMintingDate(new Collection);

    expect($job->middleware())->toBeArray();
});

it('has a retry until', function () {
    $job = new DetermineCollectionMintingDate(new Collection);

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});
