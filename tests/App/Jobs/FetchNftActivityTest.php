<?php

declare(strict_types=1);

// declare(strict_types=1);

// use App\Jobs\FetchNftActivity;
// use App\Models\Collection;
// use App\Models\Network;
// use App\Models\Nft;
// use App\Models\SpamContract;
// use App\Models\Token;
// use App\Support\Facades\Mnemonic;
// use Illuminate\Support\Facades\Http;

// beforeEach(function () {
//     Token::factory()->create([
//         'network_id' => Network::where('chain_id', 1)->firstOrFail()->id,
//         'symbol' => 'ETH',
//         'is_native_token' => 1,
//         'is_default_token' => 1,
//     ]);
// });

// it('should fetch and store nft activity', function () {
//     Mnemonic::fake([
//         'https://*-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*' => Http::response(fixtureData('mnemonic.nft_transfers'), 200),
//     ]);

//     Token::factory()->create([
//         'network_id' => Network::where('chain_id', 1)->firstOrFail()->id,
//         'symbol' => 'ETH',
//         'is_native_token' => 1,
//         'is_default_token' => 1,
//     ]);

//    $network = Network::polygon();


//     $collection = Collection::factory()->create([
//         'network_id' => $network->id,
//     ]);

//     $nft = Nft::factory()->create([
//         'token_number' => '8304',
//         'collection_id' => $collection->id,
//     ]);

//     (new FetchNftActivity($nft))->handle();

//     expect($nft->activities()->count())->toBe(18);
// });

//it('should skip fetching NFT activity for a spam collection', function () {
//    $network = Network::polygon();

//     $collectionAddress = '0x000000000a42c2791eec307fff43fa5c640e3ef7';

//     $collection = Collection::factory()->create([
//         'network_id' => $network->id,
//         'address' => $collectionAddress,
//         'owners' => null,
//     ]);

//     SpamContract::query()->insert([
//         'address' => $collectionAddress,
//         'network_id' => $network->id,
//     ]);

//     $nft = Nft::factory()->create([
//         'token_number' => '8304',
//         'collection_id' => $collection->id,
//     ]);

//     expect($nft->activities)->toBeEmpty();

//     (new FetchNftActivity($nft))->handle();

//     expect($nft->activities)->toBeEmpty();

//     Mnemonic::assertNothingSent();
// });

// it('should call the job again if response equals the limit', function () {
//     $fixture = fixtureData('mnemonic.nft_transfers');

//     Token::factory()->create([
//         'network_id' => Network::where('chain_id', 1)->firstOrFail()->id,
//         'symbol' => 'ETH',
//         'is_native_token' => 1,
//         'is_default_token' => 1,
//     ]);

//     $itemTemplate = $fixture['nftTransfers'][0];

//     $response = [
//         'nftTransfers' => collect(range(1, 500))->map(function () use ($itemTemplate) {
//             return [
//                 ...$itemTemplate,
//                 'blockchainEvent' => [
//                     ...$itemTemplate['blockchainEvent'],
//                     'txHash' => '0x'.fake()->sha1(),
//                 ],
//             ];
//         })->toArray(),
//     ];

//     Mnemonic::fake([
//         'https://*-rest.api.mnemonichq.com/foundational/v1beta2/transfers/nft?*' => Http::sequence()
//             ->push($response, 200)
//             ->push($fixture, 200),
//     ]);

//    $network = Network::polygon();

//     $collection = Collection::factory()->create([
//         'network_id' => $network->id,
//     ]);

//     $nft = Nft::factory()->create([
//         'token_number' => '8304',
//         'collection_id' => $collection->id,
//     ]);

//     (new FetchNftActivity($nft))->handle();

//     expect($nft->activities()->count())->toBe(500 + 18);
// });
