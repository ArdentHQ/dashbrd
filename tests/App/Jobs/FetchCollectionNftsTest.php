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

it('should fetch nft collections and trigger the job again with the next token', function () {
    Bus::fake();

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*/getNFTsForCollection?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_collection'), 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    expect(Nft::count())->toBe(0);
    expect(NftTrait::count())->toBe(0);

    (new FetchCollectionNfts($collection))->handle();

    Bus::assertDispatched(FetchCollectionNfts::class, fn ($job) => $job->startToken === '0x0000000000000000000000000000000000000000000000000000000000000064');

    expect(Nft::count())->toBe(100);
    expect(NftTrait::count())->toBe(585);
});

it('should fetch nft collections without triggering another job if no next token', function () {
    Bus::fake();

    $response = fixtureData('alchemy.get_nfts_for_collection');

    unset($response['nextToken']);

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*/getNFTsForCollection?contractAddress=*&withMetadata=true&limit=100' => Http::response($response, 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
        'network_id' => $network->id,
        'last_indexed_token_number' => null,
    ]);

    (new FetchCollectionNfts($collection))->handle();

    expect($collection->fresh()->last_indexed_token_number)->toBe('99');

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
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*/getNFTsForCollection?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_blacklisted_collection'), 200),
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
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*/getNFTsForCollection?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_collection'), 200),
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

    expect(Nft::count())->toBe(100);
    expect(NftTrait::count())->toBe(585);
});

it('should not store nfts if the collection supply is higher than COLLECTIONS_MAX_CAP', function () {
    Bus::fake();

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*/getNFTsForCollection?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_collection_exceeding_max_cap_supply'), 200),
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

    Alchemy::fake(Http::response(fixtureData('alchemy.get_nfts_for_collection_without_total_supply'), 200));

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
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*/getNFTsForCollection?contractAddress=*&withMetadata=true&limit=100' => Http::response(fixtureData('alchemy.get_nfts_for_collection'), 200),
    ]);

    $network = Network::polygon();
    $collection = Collection::factory()->create([
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
        'network_id' => $network->id,
    ]);

    (new FetchCollectionNfts($collection))->handle();
    expect($collection->fresh()->last_indexed_token_number)->toBe('99');
});
