<?php

declare(strict_types=1);

use App\Console\Commands\LiveDumpNfts;
use App\Enums\Chain;
use App\Models\Network;
use App\Models\Token;
use App\Support\Facades\Alchemy;
use App\Support\Facades\Mnemonic;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    Alchemy::fake(function (Request $request) {
        if ($request->method() == 'GET') {
            $path = $request->toPsrRequest()->getUri()->getPath();
            if (Str::contains($path, 'getNFTsForCollection')) {
                return Http::response(fixtureData('alchemy.get_nfts_for_contract'), 200);
            }
        }

        return Http::response(null, 404);
    });

    Mnemonic::fake([
        'https://*-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price'),
            200),
        'https://*-rest.api.mnemonichq.com/collections/v1beta2/*/traits/string?*' => Http::response(fixtureData('mnemonic.collection_traits_string'),
            200),
        'https://*-rest.api.mnemonichq.com/collections/v1beta2/*/traits/numeric?*' => Http::response(fixtureData('mnemonic.collection_traits_numeric'),
            200),
    ]);

    $network = Network::query()->where('chain_id', Chain::ETH->value)->first();

    Token::factory()->create([
        'symbol' => 'ETH',
        'network_id' => $network->id,
    ]);

    $this->fakeFileSystem = Storage::fake('live-dump');

    $fileContents = <<<'JSON'
{
   "code": 200,
   "msg": null,
   "data": [
      {
         "contract_address": "0x4e1f41613c9084fdb9e34e11fae9412427480e56",
         "name": "Terraforms",
         "symbol": "TERRAFORMS",
         "description": "Onchain land art from a dynamically generated onchain 3D world.",
         "website": "http://mathcastles.xyz",
         "email": null,
         "twitter": "mathcastles",
         "discord": "https://discord.gg/mathcastles",
         "telegram": null,
         "github": null,
         "instagram": null,
         "medium": null,
         "logo_url": "https://logo.nftscan.com/logo/0x4e1f41613c9084fdb9e34e11fae9412427480e56.png",
         "banner_url": "https://logo.nftscan.com/banner/0x4e1f41613c9084fdb9e34e11fae9412427480e56.png",
         "featured_url": null,
         "large_image_url": null,
         "attributes": null,
         "erc_type": "erc721",
         "deploy_block_number": 13823015,
         "owner": "0x7a822bce7b9fadd3ed4a533b48eb04eb22696405",
         "verified": false,
         "opensea_verified": false,
         "royalty": null,
         "items_total": 9910,
         "amounts_total": 9910,
         "owners_total": 1930,
         "opensea_floor_price": 1.2103,
         "floor_price": 1.2103,
         "collections_with_same_name": null,
         "price_symbol": "ETH",
         "volume_total": 4534352.0631,
         "sales_total": 31822,
         "average_price": 142.4911
      }
  ]
}
JSON;

    $this->fakeFileSystem->put('collection-nfts/top-eth-collections.json', $fileContents);
});

it('should fetch NFTs', function () {
    $liveDumps = collect([
        'collection-nfts/eth_0x4e1f41613c9084fdb9e34e11fae9412427480e56/nfts.json',
    ]);

    $liveDumps->each(fn ($liveDump) => expect($this->fakeFileSystem->exists($liveDump))->toBeFalse());

    $this->artisan('nfts:live-dump --collection-index=0 --chain-id=1');

    $liveDumps->each(fn ($liveDump) => expect($this->fakeFileSystem->exists($liveDump))->toBeTrue());
});

it('should run only in non-production environments', function () {
    app()->detectEnvironment(function () {
        return 'production';
    });

    $this->artisan('nfts:live-dump --collection-index=0 --chain-id=1')
        ->expectsOutput('This job is to run non-production environments only.')
        ->assertExitCode(Command::INVALID);
});

it('should return error if collection index not provided', function () {
    $this->artisan('nfts:live-dump')
        ->expectsOutput('Please provide a valid collection index. A number between 0 and '.(LiveDumpNfts::COLLECTION_LIMIT - 1))
        ->assertExitCode(Command::INVALID);
});

it('should return error if the given collection is out of bound', function () {
    $this->artisan('nfts:live-dump --collection-index=176 --chain-id=1')
        ->expectsOutput('There is no collection at the given index. The index should be less than '.LiveDumpNfts::COLLECTION_LIMIT)
        ->assertExitCode(Command::INVALID);
});

it('should return error if the given start index chunk does not exist', function () {
    $this->artisan('nfts:live-dump --collection-index=0 --chain-id=1 --start-chunk-index=45')
        ->expectsOutput('Couldn\'t find chunk file with the given index.')
        ->assertExitCode(Command::INVALID);
});

it('should continue continue from the given chunk', function () {
    $this->fakeFileSystem->put(
        'collection-nfts/eth_0x4e1f41613c9084fdb9e34e11fae9412427480e56/nft-chunks/1.json',
        json_encode(fixtureData('alchemy.get_nfts_for_contract'))
    );

    $this->artisan('nfts:live-dump --collection-index=0 --chain-id=1 --start-chunk-index=1');

    Alchemy::assertSent(function (Request $request) {
        return Str::contains($request->url(), '0x0000000000000000000000000000000000000000000000000000000000000064');
    });
});
