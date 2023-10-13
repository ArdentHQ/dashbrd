<?php

declare(strict_types=1);

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

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $handler = new Web3NftHandler(
        network: $network,
        wallet: $wallet,
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
        collectionBannerImageUrl: null,
        collectionBannerUpdatedAt: null,
        collectionOpenSeaSlug: null,
        name: null,
        description: null,
        extraAttributes: [],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
        hasError: false,
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
            collectionBannerImageUrl: null,
            collectionBannerUpdatedAt: null,
            collectionOpenSeaSlug: null,
            name: null,
            description: null,
            extraAttributes: [],
            floorPrice: null,
            traits: [],
            mintedBlock: 1000,
            mintedAt: null,
            hasError: false,
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
        collectionBannerImageUrl: null,
        collectionBannerUpdatedAt: null,
        collectionOpenSeaSlug: null,
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
        hasError: false,
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

it('should handle null values for opensea slug', function () {
    Bus::fake();

    $handler = new Web3NftHandler();

    $network = Network::firstWhere('chain_id', 1);

    $token = Token::factory()->create([
        'network_id' => $network->id,
    ]);

    $wallet = Wallet::factory()->create();

    $handler = new Web3NftHandler(
        network: $network,
        wallet: $wallet,
    );

    $data = new Web3NftData(
        tokenAddress: '0x1234',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: 'Collection Name',
        collectionSymbol: 'AME',
        collectionImage: null,
        collectionWebsite: null,
        collectionDescription: null,
        collectionSocials: null,
        collectionSupply: null,
        collectionBannerImageUrl: null,
        collectionBannerUpdatedAt: null,
        collectionOpenSeaSlug: null,
        name: null,
        description: null,
        extraAttributes: [],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
        hasError: false,
    );

    $collection = Collection::query()->create([
        'address' => '0x1234',
        'network_id' => $network->id,
        'name' => $data->collectionName.'-old',
        'slug' => Str::slug($data->collectionName),
        'symbol' => $data->collectionSymbol,
        'minted_block' => $data->mintedBlock,
        'extra_attributes' => [
            'opensea_slug' => 'test123',
        ],
    ]);

    expect(Collection::count())->toBe(1);
    expect($collection->name)->toBe($data->collectionName.'-old');
    expect($collection->extra_attributes->opensea_slug)->toBe('test123');

    $handler->store(collect([$data]));

    $collection->refresh();

    expect(Collection::count())->toBe(1);
    expect($collection->name)->toBe($data->collectionName);
    expect($collection->extra_attributes->opensea_slug)->toBe('test123');
});

it('should handle opensea slugs', function () {
    Bus::fake();

    $handler = new Web3NftHandler();

    $network = Network::firstWhere('chain_id', 1);

    $token = Token::factory()->create([
        'network_id' => $network->id,
    ]);

    $wallet = Wallet::factory()->create();

    $handler = new Web3NftHandler(
        network: $network,
        wallet: $wallet,
    );

    $data = new Web3NftData(
        tokenAddress: '0x1234',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: 'Collection Name',
        collectionSymbol: 'AME',
        collectionImage: null,
        collectionWebsite: null,
        collectionDescription: null,
        collectionSocials: null,
        collectionSupply: null,
        collectionBannerImageUrl: null,
        collectionBannerUpdatedAt: null,
        collectionOpenSeaSlug: 'test456',
        name: null,
        description: null,
        extraAttributes: [],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
        hasError: false,
    );

    $collection = Collection::query()->create([
        'address' => '0x1234',
        'network_id' => $network->id,
        'name' => $data->collectionName,
        'slug' => Str::slug($data->collectionName),
        'symbol' => $data->collectionSymbol,
        'minted_block' => $data->mintedBlock,
        'extra_attributes' => [
            'opensea_slug' => 'test123',
        ],
    ]);

    expect(Collection::count())->toBe(1);
    expect($collection->extra_attributes->opensea_slug)->toBe('test123');

    $handler->store(collect([$data]));

    $collection->refresh();

    expect(Collection::count())->toBe(1);
    expect($collection->extra_attributes->opensea_slug)->toBe('test456');
});

it('should not overwrite existing extra_attributes opensea data', function () {
    Bus::fake();

    $handler = new Web3NftHandler();

    $network = Network::firstWhere('chain_id', 1);

    $token = Token::factory()->create([
        'network_id' => $network->id,
    ]);

    $wallet = Wallet::factory()->create();

    $handler = new Web3NftHandler(
        network: $network,
        wallet: $wallet,
    );

    $data = new Web3NftData(
        tokenAddress: '0x1234',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: 'Collection Name',
        collectionSymbol: 'AME',
        collectionImage: null,
        collectionWebsite: null,
        collectionDescription: null,
        collectionSocials: null,
        collectionSupply: null,
        collectionBannerImageUrl: 'test_banner',
        collectionBannerUpdatedAt: null,
        collectionOpenSeaSlug: null,
        name: null,
        description: null,
        extraAttributes: [],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
        hasError: false,
    );

    $collection = Collection::query()->create([
        'address' => '0x1234',
        'network_id' => $network->id,
        'name' => $data->collectionName,
        'slug' => Str::slug($data->collectionName),
        'symbol' => $data->collectionSymbol,
        'minted_block' => $data->mintedBlock,
        'extra_attributes' => [
            'opensea_slug' => 'test123',
            'image' => 'existing_image',
            'banner' => null,
            'banner_updated_at' => null,
            'website' => 'test_website',
        ],
    ]);

    expect(Collection::count())->toBe(1);
    expect($collection->extra_attributes->opensea_slug)->toBe('test123');
    expect($collection->extra_attributes->image)->toBe('existing_image');
    expect($collection->extra_attributes->banner)->toBe(null);
    expect($collection->extra_attributes->banner_updated_at)->toBe(null);
    expect($collection->extra_attributes->website)->toBe('test_website');

    $handler->store(collect([$data]));

    $collection->refresh();

    expect(Collection::count())->toBe(1);
    expect($collection->extra_attributes->opensea_slug)->toBe('test123');
    expect($collection->extra_attributes->image)->toBe(null);
    expect($collection->extra_attributes->banner)->toBe('test_banner');
    expect($collection->extra_attributes->banner_updated_at)->toBeString();
    expect($collection->extra_attributes->website)->toBe(null);
});

it('should handle empty extra_attribute objects', function () {
    Bus::fake();

    $handler = new Web3NftHandler();

    $network = Network::firstWhere('chain_id', 1);

    $token = Token::factory()->create([
        'network_id' => $network->id,
    ]);

    $wallet = Wallet::factory()->create();

    $handler = new Web3NftHandler(
        network: $network,
        wallet: $wallet,
    );

    $data = new Web3NftData(
        tokenAddress: '0x1234',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: 'Collection Name',
        collectionSymbol: 'AME',
        collectionImage: null,
        collectionWebsite: null,
        collectionDescription: null,
        collectionSocials: null,
        collectionSupply: null,
        collectionBannerImageUrl: null,
        collectionBannerUpdatedAt: null,
        collectionOpenSeaSlug: 'test456',
        name: null,
        description: null,
        extraAttributes: [],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
        hasError: false,
    );

    $collection = Collection::query()->create([
        'address' => '0x1234',
        'network_id' => $network->id,
        'name' => $data->collectionName,
        'slug' => Str::slug($data->collectionName),
        'symbol' => $data->collectionSymbol,
        'minted_block' => $data->mintedBlock,
        'extra_attributes' => '{}',
    ]);

    expect(Collection::count())->toBe(1);
    expect($collection->extra_attributes->opensea_slug)->toBe(null);

    $handler->store(collect([$data]));

    $collection->refresh();

    expect(Collection::count())->toBe(1);
    expect($collection->extra_attributes->opensea_slug)->toBe('test456');
});

it('should handle null value for extra_attribute', function () {
    Bus::fake();

    $handler = new Web3NftHandler();

    $network = Network::firstWhere('chain_id', 1);

    $token = Token::factory()->create([
        'network_id' => $network->id,
    ]);

    $wallet = Wallet::factory()->create();

    $handler = new Web3NftHandler(
        network: $network,
        wallet: $wallet,
    );

    $data = new Web3NftData(
        tokenAddress: '0x1234',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: 'Collection Name',
        collectionSymbol: 'AME',
        collectionImage: null,
        collectionWebsite: null,
        collectionDescription: null,
        collectionSocials: null,
        collectionSupply: null,
        collectionBannerImageUrl: null,
        collectionBannerUpdatedAt: null,
        collectionOpenSeaSlug: 'test456',
        name: null,
        description: null,
        extraAttributes: [],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
        hasError: false,
    );

    $collection = Collection::query()->create([
        'address' => '0x1234',
        'network_id' => $network->id,
        'name' => $data->collectionName,
        'slug' => Str::slug($data->collectionName),
        'symbol' => $data->collectionSymbol,
        'minted_block' => $data->mintedBlock,
        'extra_attributes' => null,
    ]);

    expect(Collection::count())->toBe(1);
    expect($collection->extra_attributes->opensea_slug)->toBe(null);

    $handler->store(collect([$data]));

    $collection->refresh();

    expect(Collection::count())->toBe(1);
    expect($collection->extra_attributes->opensea_slug)->toBe('test456');
});

it('should not update any already filled fields in DB with empty values if hasError is true', function () {
    Bus::fake();

    $handler = new Web3NftHandler();

    $network = Network::firstWhere('chain_id', 1);

    $token = Token::factory()->create([
        'network_id' => $network->id,
    ]);

    $wallet = Wallet::factory()->create();

    $handler = new Web3NftHandler(
        network: $network,
        wallet: $wallet,
    );

    // originalData is the data that is already in the DB
    $now = Carbon::now();
    $originalData = new Web3NftData(
        tokenAddress: '0x1234',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: 'Collection Name',
        collectionSymbol: 'AME',
        collectionImage: 'test_image',
        collectionWebsite: 'www.test_website.com',
        collectionDescription: 'Collection Description',
        collectionSocials: [
            [
                'name' => 'twitter',
                'url' => 'https://twitter.com/test',
            ],
        ],
        collectionSupply: 3000,
        collectionBannerImageUrl: 'test_banner',
        collectionBannerUpdatedAt: $now,
        collectionOpenSeaSlug: 'test456',
        name: 'NFT Name',
        description: 'NFT Description',
        extraAttributes: [
            'image' => 'test_image',
            'website' => 'www.test_website.com',
            'banner' => 'test_banner',
            'banner_updated_at' => $now,
            'opensea_slug' => 'test456',
        ],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
        hasError: false,
    );

    $collection = Collection::query()->create([
        'address' => '0x1234',
        'network_id' => $network->id,
        'name' => $originalData->collectionName,
        'slug' => Str::slug($originalData->collectionName),
        'symbol' => $originalData->collectionSymbol,
        'minted_block' => $originalData->mintedBlock,
        'extra_attributes' => null,
    ]);

    $handler->store(collect([$originalData]));
    $collection->refresh();

    expect(Collection::count())->toBe(1);

    $dataWithError = new Web3NftData(
        tokenAddress: '0x1234',
        tokenNumber: '123',
        networkId: $token->network_id,
        collectionName: 'Collection Name',
        collectionSymbol: 'AME',
        collectionImage: null,
        collectionWebsite: null,
        collectionDescription: null,
        collectionSocials: null,
        collectionSupply: 3000,
        collectionBannerImageUrl: null,
        collectionBannerUpdatedAt: $now,
        collectionOpenSeaSlug: null,
        name: null,
        description: null,
        extraAttributes: [
            'image' => null,
            'website' => null,
            'banner' => null,
            'banner_updated_at' => $now,
            'opensea_slug' => null,
        ],
        floorPrice: null,
        traits: [],
        mintedBlock: 1000,
        mintedAt: null,
        hasError: true,
    );

    $handler->store(collect([$dataWithError]));
    $collection->refresh();

    // Expect all fields to be the same as before
    expect(Collection::count())->toBe(1);
    expect($collection->name)->toBe($originalData->collectionName);
    expect($collection->slug)->toBe(Str::slug($originalData->collectionName));
    expect($collection->symbol)->toBe($originalData->collectionSymbol);
    expect($collection->extra_attributes[0]['image'])->toBe($originalData->collectionImage);
    expect($collection->extra_attributes[0]['website'])->toBe($originalData->collectionWebsite);
    expect($collection->extra_attributes[0]['banner'])->toBe($originalData->collectionBannerImageUrl);
    expect($collection->extra_attributes[0]['opensea_slug'])->toBe($originalData->collectionOpenSeaSlug);
    expect($collection->nfts->first()->name)->toBe($originalData->name);
});
