<?php

declare(strict_types=1);

use App\Data\NetworkData;
use App\Data\Web3\Web3NftData;
use App\Enums\TraitDisplayType;
use App\Models\Collection;
use App\Models\Network;
use App\Models\NftTrait;
use App\Models\Token;
use App\Models\Wallet;
use App\Support\Web3NftHandler;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Str;

it('trims collection names', function () {
    Bus::fake();

    $networkData = NetworkData::from(Network::polygon()->firstOrFail());
    $wallet = Wallet::factory()->create();

    $handler = new Web3NftHandler(
        network: $networkData,
        wallet: $wallet->getData(),
    );

    $token = Token::factory()->create();

    $data = new Web3NftData(
        tokenAddress: '0x123',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: '  Collection Name  ',
        collectionSymbol: 'AME',
        collectionImage: null,
        collectionWebsite: null,
        collectionDescription: null,
        collectionSocials: null,
        collectionSupply: null,
        name: null,
        description: null,
        extraAttributes: [],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
    );

    $handler->store(collect([$data]));

    expect(Collection::count())->toBe(1);

    $collection = Collection::first();

    expect($collection->name)->toBe('Collection Name');
});

it('should throw an exception if no wallet or collection passed', function () {
    Bus::fake();

    expect(function () {
        $handler = new Web3NftHandler();

        $token = Token::factory()->create();

        $data = new Web3NftData(
            tokenAddress: '0x123',
            tokenNumber: '123',
            networkId: $token->network_id,
            collectionName: '  Collection Name  ',
            collectionSymbol: 'AME',
            collectionImage: null,
            collectionWebsite: null,
            collectionDescription: null,
            collectionSocials: null,
            collectionSupply: null,
            name: null,
            description: null,
            extraAttributes: [],
            floorPrice: null,
            traits: [],
            mintedBlock: 1000,
            mintedAt: null,
        );

        $handler->store(nfts: collect([$data]), dispatchJobs: true);
    })->toThrow(RuntimeException::class);
});

it('should not insert traits with long values', function () {
    Bus::fake();

    $handler = new Web3NftHandler();

    $token = Token::factory()->create();

    $network = Network::firstWhere('chain_id', 1);

    $nftData = new Web3NftData(
        tokenAddress: '0x123',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: 'Collection Name',
        collectionSymbol: 'AME',
        collectionImage: null,
        collectionWebsite: null,
        collectionDescription: null,
        collectionSocials: null,
        collectionSupply: null,
        name: null,
        description: null,
        extraAttributes: [],
        floorPrice: null,
        traits: [
            [
                'name' => 'name',
                'value' => 'valid',
                'displayType' => TraitDisplayType::Property,
            ],
            [
                'name' => 'name bach',
                'value' => 'Lorem Ipsum has been the industrys standard dummy text ever since',
                'displayType' => TraitDisplayType::Property,
            ],
        ],
        mintedBlock: 1000,
        mintedAt: null,
    );

    $collection = Collection::query()->create([
        'address' => '0x1234',
        'network_id' => $network->id,
        'name' => $nftData->collectionName,
        'slug' => Str::slug($nftData->collectionName),
        'symbol' => $nftData->collectionSymbol,
        'minted_block' => $nftData->mintedBlock,
    ]);

    $nft = $collection->nfts()->insert([
        'collection_id' => $collection->id,
        'wallet_id' => null,
        'token_number' => $nftData->tokenNumber,
        'name' => $nftData->name,
        'extra_attributes' => json_encode($nftData->extraAttributes),
        'created_at' => Carbon::now(),
    ]);

    $handler->upsertTraits(collect([$nftData]), collect([Str::lower($nftData->tokenAddress) => $collection]),
        Carbon::now());

    $traitCount = NftTrait::query()->count();

    expect(Collection::count())->toBe(1)
        ->and($traitCount)->toBe(1);
});
