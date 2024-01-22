<?php

declare(strict_types=1);

use App\Data\Web3\Web3CollectionFloorPrice;
use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftData;
use App\Data\Web3\Web3NftsChunk;
use App\Enums\Chain;
use App\Enums\TraitDisplayType;
use App\Exceptions\NotImplementedException;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Wallet;
use App\Services\Web3\Alchemy\AlchemyWeb3DataProvider;
use App\Support\Facades\Alchemy;
use Carbon\Carbon;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

it('should getWalletTokens', function () {
    Alchemy::fake(function (Request $request) {
        $body = json_decode($request->body(), true);
        $method = $body['method'];
        $params = $body['params'];

        return match ($method) {
            'alchemy_getTokenBalances' => Http::response(fixtureData('alchemy.erc20'), 200),
            'alchemy_getTokenMetadata' => Http::response(fixtureData('alchemy.token_metadata_'.$params[0]), 200),
            default => Http::response(null, 404),
        };
    });

    $network = Network::polygon();

    $wallet = Wallet::factory()->create();

    $provider = new AlchemyWeb3DataProvider();
    $tokens = $provider->getWalletTokens($wallet, $network);

    expect($tokens)->toBeInstanceOf(Collection::class)
        ->and($tokens)->toHaveCount(5)
        ->and($tokens[0])->toBeInstanceOf(Web3Erc20TokenData::class)
        ->and($tokens[0]->tokenAddress)->toBe('0x01e849040c418c3b7f130351a6e4630c08a7d98e');
});

it('should paginate getWalletTokens', function () {
    Alchemy::fake([
        '*' => Http::sequence()
            ->push(
                [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'result' => [
                        'address' => '',
                        'tokenBalances' => [
                            [
                                'contractAddress' => '0x1111111111111111111111111111111111111111',
                                'tokenBalance' => '0x0000000000000000000000000000000000000000000000000000000000000f08',
                            ],
                            [
                                'contractAddress' => '0x2222222222222222222222222222222222222222',
                                'tokenBalance' => '0x0000000000000000000000000000000000000000000000000000000000000f08',
                            ],
                        ],
                        'pageKey' => 'NEXTPAGE2',
                    ],
                ]
            )->push(
                [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'result' => ['decimals' => 18, 'logo' => '1', 'name' => '1', 'symbol' => '1'],
                ]
            )->push(
                [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'result' => ['decimals' => 18, 'logo' => '2', 'name' => '2', 'symbol' => '2'],
                ]
            )->push(
                [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'result' => [
                        'address' => '',
                        'tokenBalances' => [
                            [
                                'contractAddress' => '0x3333333333333333333333333333333333333333',
                                'tokenBalance' => '0x0000000000000000000000000000000000000000000000000000000000000f08',
                            ],
                        ],
                        'pageKey' => 'NEXTPAGE3',
                    ],
                ]
            )->push(
                [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'result' => ['decimals' => 18, 'logo' => '3', 'name' => '3', 'symbol' => '3'],
                ]
            )->push(
                [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'result' => [
                        'address' => '',
                        'tokenBalances' => [
                            [
                                'contractAddress' => '0x4444444444444444444444444444444444444444',
                                'tokenBalance' => '0x0000000000000000000000000000000000000000000000000000000000000f08',
                            ],
                        ],
                    ],
                ]
            )->push(
                [
                    'jsonrpc' => '2.0',
                    'id' => 1,
                    'result' => ['decimals' => 18, 'logo' => '4', 'name' => '4', 'symbol' => '4'],
                ]
            ),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $provider = new AlchemyWeb3DataProvider();
    $tokens = $provider->getWalletTokens($wallet, $network);

    expect($tokens)->toHaveCount(4)
        ->and($tokens->first()->tokenAddress)->toEqual('0x1111111111111111111111111111111111111111')
        ->and($tokens->last()->tokenAddress)->toEqual('0x4444444444444444444444444444444444444444');
});

it('should getWalletNfts', function () {
    Alchemy::fake([
        '*' => Http::response(fixtureData('alchemy.nfts_for_owner_2'), 200),
    ]);

    $network = Network::polygon();

    $wallet = Wallet::factory()->create();

    $provider = new AlchemyWeb3DataProvider();
    $tokens = $provider->getWalletNfts($wallet, $network)->nfts;

    expect($tokens)->toBeInstanceOf(Collection::class)
        ->and($tokens)->toHaveCount(4)
        ->and($tokens[0])->toBeInstanceOf(Web3NftData::class)
        ->and($tokens[0]->tokenAddress)->toBe('0x684E4ED51D350b4d76A3a07864dF572D24e6dC4c')
        ->and($tokens[2]->floorPrice)
        ->toBeInstanceOf(Web3CollectionFloorPrice::class)
        ->and($tokens[2]->floorPrice->price)->toEqual('3000000000000000')
        ->and($tokens[2]->floorPrice->currency)->toEqual('eth');
});

it('should getNftMetadata', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3/*' => Http::response(fixtureData('alchemy.nft_batch_metadata_2'), 200),
    ]);

    $user = createUser();
    $network = Network::polygon();
    $collection = CollectionModel::factory()->create(['network_id' => $network->id]);

    $nfts = collect();
    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet,
        'collection_id' => $collection,
    ]);

    $nfts->push($nft);

    $provider = new AlchemyWeb3DataProvider();
    $tokens = $provider->getNftMetadata($nfts, $network)->nfts;

    expect($tokens)->toBeInstanceOf(Collection::class)
        ->and($tokens)->toHaveCount(1)
        ->and($tokens[0])->toBeInstanceOf(Web3NftData::class)
        ->and($tokens[0]->tokenAddress)->toBe('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
});

it('should extract nft images', function () {
    Alchemy::fake([
        '*' => Http::response(fixtureData('alchemy.nfts_for_owner_2'), 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $provider = new AlchemyWeb3DataProvider();
    $tokens = $provider->getWalletNfts($wallet, $network)->nfts;

    expect($tokens)->toBeInstanceOf(Collection::class)
        ->and($tokens)->toHaveCount(4)
        ->and($tokens)->every(fn ($token) => expect($token->extraAttributes['images'])->toHaveKeys(['thumb', 'small', 'large', 'original', 'originalRaw']));
});

it('should extract nft traits', function () {
    Alchemy::fake([
        '*' => Http::response(fixtureData('alchemy.nfts_for_owner_2'), 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $provider = new AlchemyWeb3DataProvider();
    $tokens = $provider->getWalletNfts($wallet, $network)->nfts;

    expect($tokens)->toBeInstanceOf(Collection::class)
        ->and($tokens)->toHaveCount(4)
        ->and($tokens[0]->traits)->toEqual([
            ['name' => 'Faction', 'value' => 'Human', 'displayType' => TraitDisplayType::Property],
            ['name' => 'Background', 'value' => 'Flamingo Pink', 'displayType' => TraitDisplayType::Property],
        ])
        ->and($tokens[2]->traits)->toEqual([
            ['name' => 'Color', 'value' => 'Navy', 'displayType' => TraitDisplayType::Property],
            ['name' => 'Face', 'value' => 'Core', 'displayType' => TraitDisplayType::Property],
            ['name' => 'AUX', 'value' => 'Patrician', 'displayType' => TraitDisplayType::Property],
            ['name' => 'Torso', 'value' => 'Kimono', 'displayType' => TraitDisplayType::Property],

        ])
        ->and($tokens[3]->traits)->toEqual([
            ['name' => 'shirt', 'value' => 'hoodie purple', 'displayType' => TraitDisplayType::Property],
            ['name' => 'face', 'value' => 'ninja red', 'displayType' => TraitDisplayType::Property],
            ['name' => 'tier', 'value' => 'cool_1', 'displayType' => TraitDisplayType::Property],
        ]);
});

it('should throw not implemented exception when trying to resolve ENS domain', function () {
    (new AlchemyWeb3DataProvider())->getEnsDomain(
        Wallet::factory()->create()
    );
})->throws(NotImplementedException::class);

it('can get nft floor price', function () {
    Alchemy::fake([
        'https://*.g.alchemy.com/nft/v3/*/getFloorPrice?*' => Http::response(
            fixtureData('alchemy.get_floor_price'),
            200
        ),
    ]);

    $provider = new AlchemyWeb3DataProvider();
    expect($provider->getCollectionFloorPrice(Chain::ETH, 'asdf'))->toEqual(new Web3CollectionFloorPrice(
        '1235000000000000000',
        'eth',
        Carbon::parse('2023-03-30T04:08:09.791Z'),
    ));
});

it('can get nft floor price with some errors', function () {
    Alchemy::fake([
        'https://*.g.alchemy.com/nft/v3/*/getFloorPrice?*' => Http::response(fixtureData('alchemy.get_floor_price_partially_not_found'), 200),
    ]);

    $provider = new AlchemyWeb3DataProvider();
    expect($provider->getCollectionFloorPrice(Chain::ETH, 'asdf'))->toEqual(new Web3CollectionFloorPrice(
        '1247200000000000000',
        'eth',
        Carbon::parse('2023-03-30T03:59:09.707Z'),
    ));
});

it('handles error when calling nft floor price', function () {
    Alchemy::fake([
        'https://*.g.alchemy.com/nft/v3/*/getFloorPrice?*' => Http::response(
            fixtureData('alchemy.get_floor_price_not_found'),
            200
        ),
    ]);

    $provider = new AlchemyWeb3DataProvider();
    expect($provider->getCollectionFloorPrice(Chain::ETH, 'asdf'))->toBeNull();
});

it('returns null for unsupported network when calling nft floor price', function () {
    Alchemy::fake([
        'https://*.g.alchemy.com/nft/v3/*/getFloorPrice?*' => Http::response(
            fixtureData('alchemy.get_floor_price'),
            200
        ),
    ]);

    $provider = new AlchemyWeb3DataProvider();
    collect(Chain::cases())
        ->filter(fn ($case) => $case !== Chain::ETH)
        ->each(
            fn ($case) => expect($provider->getCollectionFloorPrice($case, 'asdf'))
                ->toBeNull()
        );
});

it('should get balance for a native token', function () {
    Alchemy::fake(function (Request $request) {
        $body = json_decode($request->body(), true);
        $method = $body['method'];

        return match ($method) {
            'eth_getBalance' => Http::response(fixtureData('alchemy.native'), 200),
            default => Http::response(null, 404),
        };
    });

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $provider = new AlchemyWeb3DataProvider();
    $balance = $provider->getNativeBalance($wallet, $network);

    expect($balance)->toBe('20000');
});

it('should get block data for a network', function () {
    Alchemy::fake(function (Request $request) {
        $body = json_decode($request->body(), true);
        $method = $body['method'];

        return match ($method) {
            'eth_getBlockByNumber' => Http::response(fixtureData('alchemy.block_data'), 200),
            default => Http::response(null, 404),
        };
    });

    $network = Network::polygon();

    $provider = new AlchemyWeb3DataProvider();
    $timestamp = $provider->getBlockTimestamp($network, blockNumber: 100000000);

    expect($timestamp)->toBeInstanceOf(Carbon::class);
    expect($timestamp->timestamp)->toBe(100000000);
});

it('should cache the block data', function () {
    Alchemy::fake([
        '*' => Http::sequence()->push(fixtureData('alchemy.block_data'), 200)->push(fixtureData('alchemy.block_data_alternate', 200)),
    ]);

    $network = Network::polygon();

    $cacheKey = $network->id.'-100000000';
    $cache = Cache::tags([AlchemyWeb3DataProvider::class, AlchemyWeb3DataProvider::class.'-getBlockTimestamp']);
    expect($cache->has($cacheKey))->toBeFalse();

    $provider = new AlchemyWeb3DataProvider();
    $timestamp = $provider->getBlockTimestamp($network, blockNumber: 100000000);

    expect($cache->has($cacheKey))->toBeTrue();

    expect($timestamp)->toBeInstanceOf(Carbon::class);

    // Still cached
    $timestamp = $provider->getBlockTimestamp($network, blockNumber: 100000000);
    expect($timestamp->timestamp)->toBe(100000000);

    $this->travelTo(now()->add(2, 'weeks'));
    expect($cache->has($cacheKey))->toBeFalse();

    // Fetches updated value
    $timestamp = $provider->getBlockTimestamp($network, blockNumber: 100000000);
    expect($timestamp)->toBeInstanceOf(Carbon::class);
    expect($timestamp->timestamp)->toBe(100000001);
    expect($cache->has($cacheKey))->toBeTrue();
});

it('should return rate limited middleware', function () {
    $middleware = (new AlchemyWeb3DataProvider())->getMiddleware();

    // Alchemy does not need a rate middleware
    expect($middleware)->toHaveCount(0);
});

it('should filter out nfts', function () {
    Alchemy::fake([
        '*' => Http::sequence()
            ->push(['ownedNfts' => [
                [
                    'tokenId' => '1',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'name' => 'SPAM Collection',
                        'symbol' => 'SPAM',
                        'deployedBlockNumber' => 10000,
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                        'isSpam' => true,
                    ],
                    'name' => 'SPAM',
                ],
                [
                    'tokenId' => '2',
                    'name' => 'no collection name/symbol',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                        'name' => '',
                        'symbol' => '',
                        'deployedBlockNumber' => 10000,
                    ],
                ],
                [
                    'tokenId' => '3',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'name' => 'SPAM Collection',
                        'symbol' => 'SPAM',
                        'deployedBlockNumber' => 10000,
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                    ],
                    'name' => 'NFT WITH ERROR',
                    'error' => 'some error',
                ],
                [
                    'tokenId' => '30',
                    'contract' => [
                        'tokenType' => 'ERC155',
                        'name' => 'ERC1155 Collection',
                        'symbol' => '1155',
                        'deployedBlockNumber' => 10000,
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                    ],
                    'name' => 'ERC1155',
                ],
                [
                    'tokenId' => '4',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'name' => 'Best Collection',
                        'symbol' => 'BEST',
                        'deployedBlockNumber' => 10000,
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                    ],
                    'name' => '',
                ],
                [
                    'tokenId' => '5',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'name' => 'Best Collection',
                        'symbol' => 'BEST',
                        'deployedBlockNumber' => 10000,
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                    ],
                    'name' => 'OK Both',
                ],
                [
                    'tokenId' => '6',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'name' => 'Best Collection',
                        'symbol' => null,
                        'deployedBlockNumber' => 10000,
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                    ],
                    'name' => 'OK Name',
                ],
                [
                    'tokenId' => '7',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'name' => '',
                        'symbol' => 'BEST',
                        'deployedBlockNumber' => 10000,
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                    ],
                    'name' => 'OK Symbol',
                ],
                [
                    'tokenId' => '8',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'name' => null,
                        'symbol' => null,
                        'deployedBlockNumber' => 10000,
                        'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                        'openSeaMetadata' => [
                            'collectionName' => 'BEST',
                        ],
                    ],
                    'name' => 'OK OpenSea fallback',
                ],
            ]]),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $provider = new AlchemyWeb3DataProvider();
    $nfts = $provider->getWalletNfts($wallet, $network)->nfts;

    expect($nfts)->toHaveCount(7)
        ->and($nfts->first()->name)->not->toBeNull()
        ->and($nfts->last()->name)->toEqual('OK OpenSea fallback');
});

it('should getCollectionsNfts', function () {
    $original = fixtureData('alchemy.get_nfts_for_contract');

    $altered = $original;
    // 12345 in hex
    $altered['nfts'][0]['id']['tokenId'] = '0x3039';

    Alchemy::fake([
        '*' => Http::sequence()->push($original, 200)->push($altered, 200),
    ]);

    $network = Network::polygon();

    $collection = CollectionModel::factory()->create([
        'network_id' => $network->id,
    ]);

    $provider = new AlchemyWeb3DataProvider();
    $result = $provider->getCollectionsNfts($collection);

    expect($result)->toBeInstanceOf(Web3NftsChunk::class)
        ->and($result->nfts)->toHaveCount(3)
        ->and($result->nfts[0])->toBeInstanceOf(Web3NftData::class)
        ->and($result->nextToken)->toBe('0x0000000000000000000000000000000000000000000000000000000000000064');
});
