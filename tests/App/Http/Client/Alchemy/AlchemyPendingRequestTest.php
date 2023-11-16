<?php

declare(strict_types=1);

use App\Enums\NftInfo;
use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Wallet;
use App\Support\Facades\Alchemy;
use Illuminate\Support\Facades\Http;

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
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::response(fixtureData('alchemy.nft_batch_metadata'), 200),
    ]);

    $fetchedNfts = Alchemy::nftMetadataBatch($nfts, $network);

    expect($fetchedNfts->nfts)->toHaveCount(1);
});

it('should add a flag in case of responses with errors', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_with_error'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    $collection = Alchemy::getWalletNfts($wallet, $network);
    expect($collection->nfts[0]->hasError)->toBetrue();
});

it('should not add a flag in case of valid responses', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_valid'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    $collection = Alchemy::getWalletNfts($wallet, $network);
    expect($collection->nfts[0]->hasError)->not->toBeTrue();
});

it('should not filter nfts with errors if the flag is set as true', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_with_error'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    $collection = Alchemy::getWalletNfts($wallet, $network);
    expect($collection->nfts)->toHaveCount(1);
});

it('should filter nfts with errors by default', function () {
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
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::response(fixtureData('alchemy.nft_batch_metadata_with_error'), 200),
    ]);

    $fetchedNfts = Alchemy::nftMetadataBatch($nfts, $network);

    expect($fetchedNfts->nfts)->toHaveCount(0);
});

it('should return error field with METADATA_OUTDATED if parent metadata object is empty', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_with_error_and_empty_metadata_object'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    $collection = Alchemy::getWalletNfts($wallet, $network);

    expect($collection->nfts[0]->hasError)->toBetrue();
    expect($collection->nfts[0]->info)->toBe(NftInfo::MetadataOutdated->value);
});

it('should return error field with METADATA_OUTDATED if metadata.metadata object is empty', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_with_error_and_empty_metadata_metadata_object'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    $collection = Alchemy::getWalletNfts($wallet, $network);

    expect($collection->nfts[0]->hasError)->toBetrue();
    expect($collection->nfts[0]->info)->toBe(NftInfo::MetadataOutdated->value);
});

it('should ignore arrays in trait values', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_collection_array_traits'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    $collection = Alchemy::getWalletNfts($wallet, $network);

    expect($collection->nfts[0]->traits[1])->toContain('Tails');
});

it('should handle unexpected trait values', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v2/*' => Http::sequence()
            ->push(fixtureData('alchemy.nfts_array_unexpected_traits'), 200),
    ]);

    $wallet = Wallet::factory()->create();
    $network = Network::polygon();

    $collection = Alchemy::getWalletNfts($wallet, $network);

    expect(count($collection->nfts[0]->traits))->toBe(1);
});

it('should fetch spam contracts', function () {
    Alchemy::fake([
        'https://polygon-mainnet.g.alchemy.com/nft/v3*' => Http::response(json_encode([
            'contractAddresses' => [
                '0x123',
                '0x124',
                '0x125',
            ]
        ]), 200),
    ]);

    $network = Network::polygon();

    $spamContracts = Alchemy::getSpamContracts($network);

    expect(count($spamContracts))->toBe(3);
});
