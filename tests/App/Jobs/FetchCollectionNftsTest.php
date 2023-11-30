<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionNfts;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\NftTrait;
use App\Support\Facades\Alchemy;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

it('should fetch nft collections, trigger the job again with the next token and set nft_last_fetched_at date', function () {
    Bus::fake();

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*/getNFTsForContract?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_contract'), 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    expect(Nft::count())->toBe(0);
    expect(NftTrait::count())->toBe(0);

    (new FetchCollectionNfts($collection))->handle();

    Bus::assertDispatched(FetchCollectionNfts::class, fn ($job) => $job->startToken === '0x0000000000000000000000000000000000000000000000000000000000000064');

    expect(Nft::count())->toBe(3);
    expect(NftTrait::count())->toBe(30);

    expect($collection->fresh()->extra_attributes->get('nft_last_fetched_at'))->not->toBeNull();
});

it('should fetch nft collections without triggering another job if no next token', function () {
    Bus::fake();

    $response = fixtureData('alchemy.get_nfts_for_contract');

    unset($response['pageKey']);

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*/getNFTsForContract?contractAddress=*&withMetadata=true&limit=100' => Http::response($response, 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'address' => '0xe785E82358879F061BC3dcAC6f0444462D4b5330',
        'network_id' => $network->id,
        'last_indexed_token_number' => null,
    ]);

    (new FetchCollectionNfts($collection))->handle();

    expect($collection->fresh()->last_indexed_token_number)->toBe('2');

    Bus::assertNotDispatched(FetchCollectionNfts::class);
});

it('should use the collection id and start token as unique identifier', function () {
    $collection = Collection::factory()->create();

    $startToken = '0x1';

    expect((new FetchCollectionNfts($collection, $startToken)))->uniqueId()->toBeString();
});

it('should retry the job', function () {
    $collection = Collection::factory()->create();

    expect((new FetchCollectionNfts($collection))->retryUntil())->toBeInstanceOf(Carbon::class);
});

it('should not fetch nfts if the collection address is blacklisted', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*/getNFTsForContract?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_contract_blacklisted'), 200),
    ]);

    $network = Network::polygon();
    $blacklist = config('dashbrd.blacklisted_collections');

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => $blacklist[0],
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect(Nft::count())->toBe(0);
    expect(NftTrait::count())->toBe(0);

    (new FetchCollectionNfts($collection))->handle();

    expect(Nft::count())->toBe(0);
});

it('should fetch nfts if the collection address is not blacklisted', function () {
    Bus::fake();

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*/getNFTsForContract?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_contract'), 200),
    ]);

    $network = Network::polygon();
    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $this->assertDatabaseCount('collections', 1);
    $this->assertDatabaseHas('collections', [
        'address' => $collection->address,
    ]);

    expect(Nft::count())->toBe(0);
    expect(NftTrait::count())->toBe(0);

    (new FetchCollectionNfts($collection))->handle();

    expect(Nft::count())->toBe(3);
    expect(NftTrait::count())->toBe(30);
});

it('should not store nfts if the collection supply is higher than COLLECTIONS_MAX_CAP', function () {
    Bus::fake();

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*/getNFTsForContract?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_contract_exceeding_max_cap_supply'), 200),
    ]);

    $network = Network::polygon();
    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect(Nft::count())->toBe(0);
    expect(NftTrait::count())->toBe(0);

    (new FetchCollectionNfts($collection))->handle();

    expect(Nft::count())->toBe(0);
    expect(NftTrait::count())->toBe(0);
});

it('does not store NFTs for collections that do not report a total supply', function () {
    Bus::fake();

    Alchemy::fake(Http::response(fixtureData('alchemy.get_nfts_for_contract_without_total_supply'), 200));

    $network = Network::polygon();
    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $this->assertDatabaseCount('collections', 1);

    expect(Nft::count())->toBe(0);
    expect(NftTrait::count())->toBe(0);

    (new FetchCollectionNfts($collection))->handle();

    expect(Nft::count())->toBe(0);
    expect(NftTrait::count())->toBe(0);
});

it('updates a max token number when indexing', function () {
    Bus::fake();

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*/getNFTsForContract?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_contract'), 200),
    ]);

    $network = Network::polygon();
    $collection = Collection::factory()->create([
        'address' => '0xe785E82358879F061BC3dcAC6f0444462D4b5330',
        'network_id' => $network->id,
    ]);

    (new FetchCollectionNfts($collection))->handle();
    expect($collection->fresh()->last_indexed_token_number)->toBe('2');
});

it('skips potentially full collections', function () {
    Alchemy::fake();

    $collection = Collection::factory()->create([
        'supply' => 10,
        'last_indexed_token_number' => 10,
    ]);

    (new FetchCollectionNfts($collection, startToken: null, skipIfPotentiallyFull: true))->handle();

    Alchemy::assertNothingSent();
});
