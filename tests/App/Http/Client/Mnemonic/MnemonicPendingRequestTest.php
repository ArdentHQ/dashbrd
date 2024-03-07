<?php

declare(strict_types=1);

use App\Enums\Chain;
use App\Enums\NftTransferType;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Token;
use App\Models\TokenPriceHistory;
use App\Support\Facades\Mnemonic;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Token::factory()->withGuid()->create([
        'network_id' => Network::where('chain_id', 1)->firstOrFail()->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);
});

it('should throw a custom exception on connection failures', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response([], 500),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Mnemonic::getCollectionFloorPrice(Chain::Polygon, $collection->address);
})->throws(ConnectionException::class);

it('should throw on 401', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response([], 401),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Mnemonic::getCollectionFloorPrice(Chain::Polygon, $collection->address);
})->throws(Exception::class);

it('should throw a custom exception on rate limits', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response([], 429, [
            'Retry-After' => 10,
        ]),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Mnemonic::getCollectionFloorPrice(Chain::Polygon, $collection->address);
})->throws(RateLimitException::class);

it('should not retry request on 400', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*blockTimestampGt=*' => Http::sequence()
            ->push(null, 400)
            ->push(fixtureData('mnemonic.nft_transfers'), 200),
    ]);

    $network = Network::polygon();

    $from = Carbon::now();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    ]);

    expect(fn () => Mnemonic::getCollectionActivity(Chain::Polygon, $collection->address, 100, $from))->toThrow('400 Bad Request');
});

it('should get owners', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/totals' => Http::response(['ownersCount' => '789']),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $data = Mnemonic::getCollectionOwners(Chain::Polygon, $collection->address);

    expect($data)->toBe(789);
});

it('should get banner URL for the collection', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/foundational/v1beta2/nft_contracts?contractAddresses=*' => Http::response([
            'nftContracts' => [[
                'bannerImageUrl' => 'https://example.com',
            ]],
        ]),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $banner = Mnemonic::getCollectionBanner(Chain::Polygon, $collection->address);

    expect($banner)->toBe('https://example.com');
});

it('should normalize the banner URL for the collection', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/foundational/v1beta2/nft_contracts?contractAddresses=*' => Http::response([
            'nftContracts' => [[
                'bannerImageUrl' => 'https://i.seadn.io/gae/test?w=150&auto=format',
            ]],
        ]),
    ]);

    $banner = Mnemonic::getCollectionBanner(Chain::Polygon, '0x123');

    expect($banner)->toBe('https://i.seadn.io/gae/test?w=1378&auto=format');
});

it('can handle empty banner URLs', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/foundational/v1beta2/nft_contracts?contractAddresses=*' => Http::response([
            'nftContracts' => [[
                'bannerImageUrl' => '',
            ]],
        ]),
    ]);

    $banner = Mnemonic::getCollectionBanner(Chain::Polygon, '0x123');

    expect($banner)->toBeNull();
});

it('should get volume', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/sales_volume/DURATION_1_DAY/GROUP_BY_PERIOD_1_DAY' => Http::sequence()
            ->push([
                'dataPoints' => [
                    ['volume' => '12.3', 'timestamp' => '2024-01-05T00:00:00Z'],
                ],
            ], 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $data = Mnemonic::getLatestCollectionVolume(Chain::Polygon, $collection->address);

    expect($data->value)->toBe('12300000000000000000');
    expect($data->date->toDateString())->toBe('2024-01-05');
});

it('should get total periodic volume', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/sales_volume/DURATION_30_DAYS/GROUP_BY_PERIOD_1_DAY' => Http::sequence()
            ->push([
                'dataPoints' => [
                    ['volume' => '12.3', 'timestamp' => '2024-01-05T00:00:00Z'],
                ],
            ], 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $data = Mnemonic::getCollectionVolumeHistory(Chain::Polygon, $collection->address);

    expect($data->first()->value)->toBe('12300000000000000000');
    expect($data->first()->date->toDateString())->toBe('2024-01-05');
});

it('should handle no volume', function ($request) {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/collections/v1beta2/*/sales_volume/DURATION_1_DAY/GROUP_BY_PERIOD_1_DAY' => Http::sequence()
            ->push($request, 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $data = Mnemonic::getLatestCollectionVolume(Chain::Polygon, $collection->address);

    expect($data->value)->toBe('0');
})->with([
    'null volume' => [[
        'dataPoints' => [
            ['volume' => null],
        ],
    ]],

    'missing volume' => [[
        'dataPoints' => [
            ['not-volume' => null],
        ],
    ]],

    'null dataPoints' => [[
        'dataPoints' => null,
    ]],
]);

it('should fetch the collection activity', function () {
    Mnemonic::fake([
        'https://*-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*' => Http::response(fixtureData('mnemonic.nft_transfers'), 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    ]);

    // Note: limit is ignored because the fixture is fixed size
    $data = Mnemonic::getCollectionActivity(Chain::Polygon, $collection->address, 100);

    expect($data)->toHaveCount(18);

    $data = $data->first();

    expect($data->contractAddress)->toBe('0x23581767a106ae21c074b2276d25e5c3e136a68b');
    expect($data->tokenId)->toBe('8304');
    expect($data->sender)->toBe('0x0000000000000000000000000000000000000000');
    expect($data->recipient)->toBe('0xe66e1e9e37e4e148b21eb22001431818e980d060');
    expect($data->txHash)->toBe('0x8f1c4d575332c9a89ceec4d3d05960e23a17ec385912b00f4e970faf446ae4de');
    expect($data->logIndex)->toBe('164');
    expect($data->type)->toBe(NftTransferType::Mint);
    expect($data->timestamp->toIso8601String())->toBe('2022-04-16T16:39:27+00:00');
    expect($data->totalNative)->toBe(null);
    expect($data->totalUsd)->toBe(7547.995011517354);
});

it('should fetch burn activity', function () {
    Mnemonic::fake([
        'https://*-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*' => Http::response(fixtureData('mnemonic.burn_transfers'), 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    ]);

    // Note: limit is ignored because the fixture is fixed size
    $data = Mnemonic::getBurnActivity(Chain::Polygon, $collection->address, 100, now());

    expect($data)->toHaveCount(8);

    $data = $data->first();

    expect($data->contractAddress)->toBe('0x23581767a106ae21c074b2276d25e5c3e136a68b');
    expect($data->tokenId)->toBe('8304');
    expect($data->sender)->toBe('0x0000000000000000000000000000000000000000');
    expect($data->recipient)->toBe('0xe66e1e9e37e4e148b21eb22001431818e980d060');
    expect($data->txHash)->toBe('0x8f1c4d575332c9a89ceec4d3d05960e23a17ec385912b00f4e970faf446ae4de');
    expect($data->logIndex)->toBe('164');
    expect($data->type)->toBe(NftTransferType::Burn);
    expect($data->timestamp->toIso8601String())->toBe('2022-04-16T16:39:27+00:00');
    expect($data->totalNative)->toBe(null);
    expect($data->totalUsd)->toBe(7547.995011517354);

    Mnemonic::assertSent(function ($request) {
        return $request->data()['blockTimestampGt'] !== null;
    });
});

it('should convert total to native currency by using historical price for the given date', function () {
    Mnemonic::fake([
        'https://*-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*' => Http::response(fixtureData('mnemonic.nft_transfers'), 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    ]);

    $ethToken = Token::whereHas('network', fn ($query) => $query
        ->where('chain_id', Chain::ETH->value)
        ->where('is_mainnet', true)
    )->firstOrFail();

    TokenPriceHistory::query()->create([
        'token_guid' => $ethToken->tokenGuid->guid,
        'price' => 1500,
        'currency' => 'usd',
        'timestamp' => Carbon::parse('2022-04-16T10:00:00Z'),
    ]);

    // Note: limit is ignored because the fixture is fixed size
    $data = Mnemonic::getCollectionActivity(Chain::Polygon, $collection->address, 100);

    expect($data)->toHaveCount(18);

    $data = $data->first();

    expect($data->contractAddress)->toBe('0x23581767a106ae21c074b2276d25e5c3e136a68b');
    expect($data->tokenId)->toBe('8304');
    expect($data->sender)->toBe('0x0000000000000000000000000000000000000000');
    expect($data->recipient)->toBe('0xe66e1e9e37e4e148b21eb22001431818e980d060');
    expect($data->txHash)->toBe('0x8f1c4d575332c9a89ceec4d3d05960e23a17ec385912b00f4e970faf446ae4de');
    expect($data->logIndex)->toBe('164');
    expect($data->type)->toBe(NftTransferType::Mint);
    expect($data->timestamp->toIso8601String())->toBe('2022-04-16T16:39:27+00:00');
    expect($data->totalNative)->toBe(5.031996674344903);
    expect($data->totalUsd)->toBe(7547.995011517354);
});

it('should convert total to native currency by using historical price for the period', function () {
    Mnemonic::fake([
        'https://*-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*' => Http::response(fixtureData('mnemonic.nft_transfers'),
            200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    ]);

    $ethToken = Token::whereHas('network', fn ($query) => $query
        ->where('chain_id', Chain::ETH->value)
        ->where('is_mainnet', true)
    )->firstOrFail();

    TokenPriceHistory::query()->insert([
        [
            'token_guid' => $ethToken->tokenGuid->guid,
            'price' => 1510,
            'currency' => 'usd',
            'timestamp' => Carbon::parse('2022-04-15T10:00:00Z'),
        ],
        [
            'token_guid' => $ethToken->tokenGuid->guid,
            'price' => 1500,
            'currency' => 'usd',
            'timestamp' => Carbon::parse('2022-04-17T08:00:00Z'),
        ],
    ]);

    // Note: limit is ignored because the fixture is fixed size
    $data = Mnemonic::getCollectionActivity(Chain::Polygon, $collection->address, 100);

    expect($data)->toHaveCount(18);

    $data = $data->first();

    expect($data->contractAddress)->toBe('0x23581767a106ae21c074b2276d25e5c3e136a68b');
    expect($data->tokenId)->toBe('8304');
    expect($data->sender)->toBe('0x0000000000000000000000000000000000000000');
    expect($data->recipient)->toBe('0xe66e1e9e37e4e148b21eb22001431818e980d060');
    expect($data->txHash)->toBe('0x8f1c4d575332c9a89ceec4d3d05960e23a17ec385912b00f4e970faf446ae4de');
    expect($data->logIndex)->toBe('164');
    expect($data->type)->toBe(NftTransferType::Mint);
    expect($data->timestamp->toIso8601String())->toBe('2022-04-16T16:39:27+00:00');
    expect($data->totalNative)->toBe(5.031996674344903);
    expect($data->totalUsd)->toBe(7547.995011517354);
});

it('should ignore activity with unexpected label', function () {
    $response = fixtureData('mnemonic.nft_transfers');

    $response['nftTransfers'][1]['labels'] = ['LABEL_TEST'];

    Mnemonic::fake([
        'https://*-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*' => Http::response($response, 200),
    ]);

    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    ]);

    // Note: limit is ignored because the fixture is fixed size
    $data = Mnemonic::getCollectionActivity(Chain::Polygon, $collection->address, 100);

    expect($data)->toHaveCount(18);
});

it('should fetch activity from date', function () {
    $from = Carbon::now();

    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*blockTimestampGt=*' => Http::response(fixtureData('mnemonic.nft_transfers'), 200),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'address' => '0x23581767a106ae21c074b2276d25e5c3e136a68b',
    ]);

    $data = Mnemonic::getCollectionActivity(Chain::Polygon, $collection->address, 100, $from);

    expect($data)->toHaveCount(18);

    $data = $data->first();

    expect($data->contractAddress)->toBe('0x23581767a106ae21c074b2276d25e5c3e136a68b');
    expect($data->tokenId)->toBe('8304');
    expect($data->sender)->toBe('0x0000000000000000000000000000000000000000');
    expect($data->recipient)->toBe('0xe66e1e9e37e4e148b21eb22001431818e980d060');
    expect($data->txHash)->toBe('0x8f1c4d575332c9a89ceec4d3d05960e23a17ec385912b00f4e970faf446ae4de');
    expect($data->logIndex)->toBe('164');
    expect($data->type)->toBe(NftTransferType::Mint);
    expect($data->timestamp->toIso8601String())->toBe('2022-04-16T16:39:27+00:00');
    expect($data->totalNative)->toBe(null);
    expect($data->totalUsd)->toBe(7547.995011517354);
});

it('should return null floor price on 400', function () {
    Mnemonic::fake([
        'https://ethereum-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::sequence()
            ->push(null, 400),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    expect(Mnemonic::getCollectionFloorPrice(Chain::ETH, $collection->address))->toBeNull();
});
