<?php

declare(strict_types=1);

use App\Enums\Chain;
use App\Jobs\FetchCollectionFloorPrice;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Token;
use App\Support\Facades\Opensea;
use Carbon\Carbon;

it('should fetch nft collection floor price', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Opensea::response(fixtureData('opensea.collection_stats')),
    ]);

    $network = Network::where('chain_id', Chain::ETH->value)->first();

    $token = Token::factory(['network_id' => $network->id])->create([
        'symbol' => 'ETH',
    ]);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => null,
        'floor_price_token_id' => null,
        'floor_price_retrieved_at' => null,
        'extra_attributes' => ['opensea_slug' => 'testy'],
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect($collection->floor_price)->toBeNull()
        ->and($collection->floor_price_token_id)->toBeNull()
        ->and($collection->floor_price_retrieved_at)->toBeNull();

    (new FetchCollectionFloorPrice($network->chain_id, $collection->address))->handle();

    $collection->refresh();

    expect($collection->floor_price)->toBe('1229900000000000000')
        ->and($collection->floor_price_token_id)->toBe($token->id);

    expect($collection->floorPriceHistory()->count())->toBe(1);

    $floorPriceHistory = $collection->floorPriceHistory()->first();

    expect($floorPriceHistory->floor_price)->toBe('1229900000000000000')
        ->and($floorPriceHistory->token_id)->toBe($token->id)
        ->and($floorPriceHistory->retrieved_at)->toBeInstanceOf(Carbon::class);
});

it('should handle null floor price in response', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Opensea::response(fixtureData('opensea.collection_stats_floor_price_null')),
    ]);

    $network = Network::where('chain_id', Chain::ETH->value)->first();

    $token = Token::factory(['network_id' => $network->id])->create([
        'symbol' => 'ETH',
    ]);

    $retrievedAt = Carbon::now()->subDay(1);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => 123,
        'floor_price_token_id' => $token->id,
        'floor_price_retrieved_at' => $retrievedAt,
        'extra_attributes' => ['opensea_slug' => 'testy'],
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect($collection->floor_price)->toBe(123)
        ->and($collection->floor_price_token_id)->toBe($token->id)
        ->and($collection->floor_price_retrieved_at->timestamp)->toBe($retrievedAt->timestamp);

    (new FetchCollectionFloorPrice($network->chain_id, $collection->address))->handle();

    $collection->refresh();

    expect($collection->floor_price)->toBe(null)
        ->and($collection->floor_price_token_id)->toBe(null)
        ->and($collection->floor_price_retrieved_at->gt($retrievedAt))->toBe(true);

    expect($collection->floorPriceHistory()->count())->toBe(0);
});

it('should handle non existing collection when fetching floor price', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2/collections*' => Opensea::response(fixtureData('opensea.collection_stats_missing_collection'), 404),
    ]);

    $network = Network::where('chain_id', Chain::ETH->value)->first();

    $token = Token::factory(['network_id' => $network->id])->create([
        'symbol' => 'ETH',
    ]);

    $retrievedAt = Carbon::now()->subDay(1);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => 123,
        'floor_price_token_id' => $token->id,
        'floor_price_retrieved_at' => $retrievedAt,
        'extra_attributes' => ['opensea_slug' => 'testy'],
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect($collection->floor_price)->toBe(123)
        ->and($collection->floor_price_token_id)->toBe($token->id)
        ->and($collection->floor_price_retrieved_at->timestamp)->toBe($retrievedAt->timestamp);

    (new FetchCollectionFloorPrice($network->chain_id, $collection->address))->handle();

    $collection->refresh();

    expect($collection->floor_price)->toBe(null)
        ->and($collection->floor_price_token_id)->toBe(null)
        ->and($collection->floor_price_retrieved_at->gt($retrievedAt))->toBe(true);
});

it('should fetch nft collection floor price and handle null', function () {
    $network = Network::polygon();
    $token = Token::factory()->create(['network_id' => $network->id, 'symbol' => 'eth']);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => '1',
        'floor_price_token_id' => $token->id,
        'floor_price_retrieved_at' => Carbon::now(),
    ]);

    expect($collection->floor_price)->toBe('1')
        ->and($collection->floor_price_token_id)->toBe($token->id)
        ->and($collection->floor_price_retrieved_at)->not()->toBeNull();

    (new FetchCollectionFloorPrice($network->chain_id, $collection->address))->handle();

    $collection->refresh();

    expect($collection->floor_price)->toBeNull()
        ->and($collection->floor_price_token_id)->toBeNull()
        ->and($collection->floor_price_retrieved_at)->not()->toBeNull();
});

it('should use the collection address and network id as a unique job identifier', function () {
    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'address' => '0x12345',
        'network_id' => $network->id,
    ]);

    expect((new FetchCollectionFloorPrice($network->chain_id, $collection->address))->uniqueId())->toBe('fetch-nft-collection-floor-price:'.$network->chain_id.'-0x12345');
});

it('has a default retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionFloorPrice($collection->network->chain_id, $collection->address))->retryUntil())->toBeInstanceOf(DateTime::class);
});
