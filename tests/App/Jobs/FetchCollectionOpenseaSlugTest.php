<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionOpenseaSlug;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Support\Facades\Opensea;

it('should fetch opensea slug', function () {
    Opensea::fake([
        'https://api.opensea.io/api/v2*' => Opensea::response(fixtureData('opensea.nft')),
    ]);

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    // Collections requires at least one nft
    Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    (new FetchCollectionOpenseaSlug($collection))->handle();

    expect($collection->fresh()->extra_attributes->get('opensea_slug'))->toBe('y00ts');
    expect($collection->fresh()->extra_attributes->get('opensea_slug_last_fetched_at'))->not->toBeNull();
});

it('should not update opensea slug if no result', function () {
    Opensea::shouldReceive('nft')->andReturnNull();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    // Collections requires at least one nft
    Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    (new FetchCollectionOpenseaSlug($collection))->handle();

    expect($collection->fresh()->extra_attributes->get('opensea_slug'))->toBeNull();
    expect($collection->fresh()->extra_attributes->get('opensea_slug_last_fetched_at'))->not->toBeNull();
});
