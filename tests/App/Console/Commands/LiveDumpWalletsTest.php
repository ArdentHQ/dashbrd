<?php

declare(strict_types=1);

use App\Support\Facades\Alchemy;
use App\Support\Facades\Mnemonic;
use App\Support\Facades\Moralis;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

it('fetches NFTs', function () {
    config([
        'dashbrd.live_dump_wallets' => ['0x123456789'],
    ]);

    Alchemy::fake(function (Request $request) {
        if ($request->method() == 'GET') {
            $path = $request->toPsrRequest()->getUri()->getPath();
            if (Str::endsWith($path, 'getNFTs')) {
                return Http::response(fixtureData('alchemy.nfts'), 200);
            }
        }

        return Http::response(null, 404);
    });

    Mnemonic::fake([
        'https://*-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price'), 200),
        'https://*-rest.api.mnemonichq.com/collections/v1beta2/*/traits/string?*' => Http::response(fixtureData('mnemonic.collection_traits_string'), 200),
        'https://*-rest.api.mnemonichq.com/collections/v1beta2/*/traits/numeric?*' => Http::response(fixtureData('mnemonic.collection_traits_numeric'), 200),
    ]);

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*/nft?*' => Http::response(fixtureData('moralis.nfts'), 200),
    ]);

    $fakeFileSystem = Storage::fake('live-dump');

    $liveDumps = collect([
        'alchemy_eth_nfts_0x123456789.json',
        'moralis_polygon_nfts_0x123456789.json',
        'mnemonic_nft_collection_traits.json',
    ]);

    $liveDumps->each(fn ($liveDump) => expect($fakeFileSystem->exists($liveDump))->toBeFalse());

    $this->artisan('wallets:live-dump');

    $liveDumps->each(fn ($liveDump) => expect($fakeFileSystem->exists($liveDump))->toBeTrue());
});
