<?php

declare(strict_types=1);

use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Network;
use App\Models\Wallet;
use App\Support\Facades\Alchemy;
use Illuminate\Support\Facades\Http;

it('should throw a connection exception on server errors', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::response(null, 500),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon()->firstOrFail();

    Alchemy::getWalletTokens($wallet, $network);
})->throws(ConnectionException::class);

it('should throw a custom exception on 429 status code', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::response(null, 429),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon()->firstOrFail();

    Alchemy::getWalletTokens($wallet, $network);
})->throws(RateLimitException::class);

it('should not retry request on 400', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::sequence()
            ->push(null, 400)
            ->push(fixtureData('alchemy.erc20'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon()->firstOrFail();

    expect(fn () => Alchemy::getWalletTokens($wallet, $network))->toThrow('400 Bad Request');
});

it('should handle arrays in NFT descriptions', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_description'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon()->firstOrFail();

    expect(Alchemy::getWalletNfts($wallet, $network)->nfts[0]->description)->toBeString();
});

it('should increment default size for banner image if it is not null in parseNft', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_description_with_banner'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon()->firstOrFail();

    $collection = Alchemy::getWalletNfts($wallet, $network);

    expect($collection->nfts[0]->collectionBannerImageUrl)->toContain('w=1378');
});
