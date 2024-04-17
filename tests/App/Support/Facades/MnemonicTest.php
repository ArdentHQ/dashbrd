<?php

declare(strict_types=1);

use App\Data\Web3\Web3CollectionFloorPrice;
use App\Enums\Chain;
use App\Http\Client\Mnemonic\MnemonicUnknownChainException;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Mnemonic;
use Illuminate\Support\Facades\Http;

it('can use the facade', function () {
    Mnemonic::fake([
        'https://ethereum-rest.api.mnemonichq.com/marketplaces/v1beta2/floors/*' => Http::response(fixtureData('mnemonic.nft_floor_price'), 200),
    ]);

    $network = Network::firstWhere('chain_id', Chain::ETH);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);
    $data = Mnemonic::getCollectionFloorPrice(Chain::ETH, $collection->address);

    expect($data)->toBeInstanceOf(Web3CollectionFloorPrice::class);
});

it('throws if unknown chain', function () {
    Mnemonic::send('get', '');
})->throws(MnemonicUnknownChainException::class);
