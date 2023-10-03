<?php

declare(strict_types=1);

use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Wallet;
use App\Support\Facades\Alchemy;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

it('should throw a connection exception on server errors', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::response(null, 500),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    Alchemy::getWalletTokens($wallet, $network);
})->throws(ConnectionException::class);

it('should throw a custom exception on 429 status code', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::response(null, 429),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    Alchemy::getWalletTokens($wallet, $network);
})->throws(RateLimitException::class);

it('should not retry request on 400', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/v2/*' => Http::sequence()
            ->push(null, 400)
            ->push(fixtureData('alchemy.erc20'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    expect(fn () => Alchemy::getWalletTokens($wallet, $network))->toThrow('400 Bad Request');
});

it('should handle arrays in NFT descriptions', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_description'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    expect(Alchemy::getWalletNfts($wallet, $network)->nfts[0]->description)->toBeString();
});

it('should increment default size for banner image if it is not null in parseNft', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_description_with_banner'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    $collection = Alchemy::getWalletNfts($wallet, $network);

    expect($collection->nfts[0]->collectionBannerImageUrl)->toContain('w=1378');
});

it('should fetch nft metadata', function () {
    $user = createUser();

    $network = Network::polygon();
    $collection = Collection::factory()->create(['network_id' => $network->id]);

    $nfts = collect();
    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet,
        'collection_id' => $collection,
    ]);

    $nfts->push($nft);

    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/vPBCkZfjIE8rvfBVbVS7yB92LDQqQn8y/getNFTMetadataBatch' => Http::response(fixtureData('alchemy.nft_batch_metadata'), 200),
    ]);

    $fetchedNfts = Alchemy::nftMetadata($nfts, $collection);
    Log::info(['fetchedNfts' => $fetchedNfts]);

    expect($fetchedNfts->nfts)->toHaveCount(1);
});
