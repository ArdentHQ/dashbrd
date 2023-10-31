<?php

declare(strict_types=1);

use App\Data\Web3\Web3Erc20TokenData;
use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Data\Web3\Web3NftData;
use App\Enums\Chain;
use App\Exceptions\NotImplementedException;
use App\Jobs\Middleware\RateLimited;
use App\Models\Collection as CollectionModel;
use App\Models\Network;
use App\Models\Wallet;
use App\Services\Web3\Moralis\MoralisWeb3DataProvider;
use App\Support\Facades\Moralis;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

it('should getWalletTokens', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.erc20'), 200),
    ]);

    $network = Network::polygon();

    $wallet = Wallet::factory()->create();

    $provider = new MoralisWeb3DataProvider();
    $tokens = $provider->getWalletTokens($wallet, $network);

    expect($tokens)->toBeInstanceOf(Collection::class)
        ->and($tokens)->toHaveCount(3)
        ->and($tokens[0])->toBeInstanceOf(Web3Erc20TokenData::class)
        ->and($tokens[0]->tokenAddress)->toBe('0xcab66b484123ecc93673b30d9e543b2204bf0369');
});

it('should getWalletNfts', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*/nft?*' => Http::response(fixtureData('moralis.nfts'), 200),
    ]);

    $network = Network::polygon();

    $wallet = Wallet::factory()->create();

    $provider = new MoralisWeb3DataProvider();
    $tokens = $provider->getWalletNfts($wallet, $network)->nfts;

    expect($tokens)->toBeInstanceOf(Collection::class)
        ->and($tokens)->toHaveCount(47)
        ->and($tokens[0])->toBeInstanceOf(Web3NftData::class)
        ->and($tokens[0]->tokenAddress)->toBe('0x5d666f215a85b87cb042d59662a7ecd2c8cc44e6');
});

it('can get nft floor price', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/nft/*/lowestprice?*' => Http::response(fixtureData('moralis.nfts_lowestprice'), 200),
    ]);

    $provider = new MoralisWeb3DataProvider();

    expect($provider->getNftCollectionFloorPrice(Chain::ETH, ''))->toEqual(new Web3NftCollectionFloorPrice(
        '1000000000000000',
        'eth',
        Carbon::parse('2021-06-04T16:00:15'),
    ));
});

it('handles 404 when calling nft floor price', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/nft/*/lowestprice?*' => Http::response(null, 404),
    ]);

    $provider = new MoralisWeb3DataProvider();
    expect($provider->getNftCollectionFloorPrice(Chain::ETH, 'asdf'))->toBeNull();
});

it('can get native balance for a wallet', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.native'), 200),
    ]);

    $network = Network::polygon();

    $wallet = Wallet::factory()->create();

    $provider = new MoralisWeb3DataProvider();

    expect($provider->getNativeBalance($wallet, $network))->toBe('20000');
});

it('should return rate limited middleware', function () {
    $middleware = (new MoralisWeb3DataProvider())->getMiddleware();

    expect($middleware)->toHaveCount(1);
    expect($middleware[0])->toBeInstanceOf(RateLimited::class);
});

it('should filter out nfts', function () {
    Moralis::fake([
        '*' => Http::sequence()
            ->push(['result' => [[
                'contract_type' => 'ERC721',
                'token_address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                'token_id' => '1',
                'name' => '',
                'symbol' => '',
                'block_number_minted' => 10000,
                'normalized_metadata' => [
                    'name' => 'missing collection name/symbol',
                ],
            ], [
                'contract_type' => 'ERC721',
                'token_address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                'token_id' => '2',
                'possible_spam' => true,
                'block_number_minted' => 10000,
            ], [
                'contract_type' => 'ERC1155',
                'token_address' => '0x2253399124f0cbb46d2cbacd8a89cf0599974963',
                'token_id' => '1',
                'block_number_minted' => 10000,
            ], [
                'contract_type' => 'ERC721',
                'token_address' => '0x2253399124f0cbb46d2cbacd8a89cf0599974963',
                'token_id' => '2',
                'name' => 'Best Collection', 'symbol' => 'BEST',
                'block_number_minted' => 10000,
                'normalized_metadata' => [
                    'name' => '',
                ],
            ], [
                'contract_type' => 'ERC721',
                'token_address' => '0x2253399124f0cbb46d2cbacd8a89cf0599974963',
                'token_id' => '2',
                'name' => 'Best Collection', 'symbol' => 'BEST',
                'block_number_minted' => 10000,
                'normalized_metadata' => [
                    'name' => 'OK both',
                ],
            ], [
                'contract_type' => 'ERC721',
                'token_address' => '0x2253399124f0cbb46d2cbacd8a89cf0599974963',
                'token_id' => '3',
                'name' => 'Best Collection', 'symbol' => null,
                'block_number_minted' => 10000,
                'normalized_metadata' => [
                    'name' => 'OK only name',
                ],
            ], [
                'contract_type' => 'ERC721',
                'token_address' => '0x2253399124f0cbb46d2cbacd8a89cf0599974963',
                'token_id' => '3',
                'name' => null, 'symbol' => 'BEST',
                'block_number_minted' => 10000,
                'normalized_metadata' => [
                    'name' => 'OK only symbol',
                ],
            ]]])
            ->push(fixtureData('moralis.nfts_lowestprice'), 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $provider = new MoralisWeb3DataProvider();
    $nfts = $provider->getWalletNfts($wallet, $network)->nfts;

    expect($nfts)->toHaveCount(4)
        ->and($nfts->first()->name)->toBeNull()
        ->and($nfts->last()->name)->toEqual('OK only symbol');
});

it('should getCollectionsNfts and throw NotImplementedException', function () {
    expect(function () {
        $provider = new MoralisWeb3DataProvider();
        $provider->getCollectionsNfts(CollectionModel::factory()->create(), null);
    })->toThrow(NotImplementedException::class);
});

it('can get block data for a network', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.block'), 200),
    ]);

    $network = Network::polygon();

    $provider = new MoralisWeb3DataProvider();

    $timestamp = $provider->getBlockTimestamp($network, blockNumber: 100000000);

    expect($timestamp)->toBeInstanceOf(Carbon::class);
});

it('should cache the block data', function () {
    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::sequence()->push(fixtureData('moralis.block'), 200)->push(fixtureData('moralis.block_alternate', 200)),
    ]);

    $network = Network::polygon();

    $cache = Cache::tags([MoralisWeb3DataProvider::class, MoralisWeb3DataProvider::class.'-getBlockTimestamp']);
    $cacheKey = $network->id.'-100000000';
    expect($cache->has($cacheKey))->toBeFalse();

    $provider = new MoralisWeb3DataProvider();
    $timestamp = $provider->getBlockTimestamp($network, blockNumber: 100000000);

    expect($cache->has($cacheKey))->toBeTrue();

    expect($timestamp->timestamp)->toBe(1683722239);

    // Still cached
    $timestamp = $provider->getBlockTimestamp($network, blockNumber: 100000000);
    expect($timestamp->timestamp)->toBe(1683722239);

    $this->travelTo(now()->add(2, 'weeks'));
    expect($cache->has($cacheKey))->toBeFalse();

    // Fetches updated value
    $timestamp = $provider->getBlockTimestamp($network, blockNumber: 100000000);
    expect($timestamp->timestamp)->toBe(1681130239);
    expect($cache->has($cacheKey))->toBeTrue();
});
