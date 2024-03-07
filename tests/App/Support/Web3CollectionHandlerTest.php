<?php

declare(strict_types=1);

use App\Data\Web3\Web3CollectionTrait;
use App\Enums\TraitDisplayType;
use App\Models\Collection;
use App\Models\CollectionTrait;
use App\Support\Web3CollectionHandler;

it('adds traits', function () {
    $collection = Collection::factory()->create();

    $trait1 = new Web3CollectionTrait(
        name: 'First',
        value: 'Blue',
        valueMin: null,
        valueMax: null,
        nftsPercentage: 0,
        displayType: TraitDisplayType::Property,
    );

    $trait2 = new Web3CollectionTrait(
        name: 'Second',
        value: 'Black',
        valueMin: null,
        valueMax: null,
        nftsPercentage: 0,
        displayType: TraitDisplayType::Property,
    );

    (new Web3CollectionHandler)->storeTraits($collection->id, collect([
        $trait1, $trait2,
    ]));

    $traits = CollectionTrait::orderBy('name')->get();

    expect($traits[0]->value)->toBe('Blue');
    expect($traits[1]->value)->toBe('Black');
});
