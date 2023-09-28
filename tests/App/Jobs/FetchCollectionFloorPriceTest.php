<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionFloorPrice;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Token;
use App\Support\Facades\Mnemonic;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

it('should fetch nft collection floor price', function () {
    Config::set('dashbrd.web3_providers.'.FetchCollectionFloorPrice::class, 'mnemonic');

    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price'), 200),
    ]);

    $network = Network::polygon();

    $token = Token::factory(['network_id' => $network->id])->matic()->create();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => null,
        'floor_price_token_id' => null,
        'floor_price_retrieved_at' => null,
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect($collection->floor_price)->toBeNull()
        ->and($collection->floor_price_token_id)->toBeNull()
        ->and($collection->floor_price_retrieved_at)->toBeNull();

    (new FetchCollectionFloorPrice($network->chain_id, $collection->address))->handle();

    $collection->refresh();

    expect($collection->floor_price)->toBe('10267792581881993')
        ->and($collection->floor_price_token_id)->toBe($token->id);
});

it('should fetch nft collection floor price and handle null', function () {
    Config::set('dashbrd.web3_providers.'.FetchCollectionFloorPrice::class, 'mnemonic');

    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price_null'),
            200),
    ]);

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

it('has a retry limit', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionFloorPrice($collection->network->chain_id, $collection->address))->retryUntil())->toBeInstanceOf(DateTime::class);
});
