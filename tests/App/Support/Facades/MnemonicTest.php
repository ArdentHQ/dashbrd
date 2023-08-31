<?php

declare(strict_types=1);

use App\Data\Web3\Web3NftCollectionFloorPrice;
use App\Enums\Chains;
use App\Http\Client\Mnemonic\MnemonicUnknownChainException;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;
use Illuminate\Support\Facades\Http;

it('can use the facade', function () {
    Mnemonic::fake([
        'https://polygon-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price'), 200),
    ]);

    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);
    $data = Mnemonic::getNftCollectionFloorPrice(Chains::Polygon, $collection->address);

    expect($data)->toBeInstanceOf(Web3NftCollectionFloorPrice::class);
});

it('throws if unknown chain', function () {
    Mnemonic::send('get', '');
})->throws(MnemonicUnknownChainException::class);
