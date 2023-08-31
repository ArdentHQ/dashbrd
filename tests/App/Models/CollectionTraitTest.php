<?php

declare(strict_types=1);

use App\Enums\TraitDisplayType;
use App\Models\CollectionTrait;
use App\Models\Nft;

it('can retrieve nfts', function () {
    [$nft1, $nft2] = Nft::factory(2)->create();

    $trait = CollectionTrait::factory()->create(['collection_id' => $nft1['collection_id']]);

    $nft1->traits()->attach($trait);
    $nft2->traits()->attach($trait);

    expect($trait->nfts()->count())->toBe(2);
});

it('can explode value columns', function () {
    $values = CollectionTrait::explodeValueTypeColumns(TraitDisplayType::Property, 'some_string');
    expect($values)->toEqual([
        'value_string' => 'some_string',
        'value_numeric' => null,
        'value_date' => null,
    ]);
});

it('should properly filter trait values', function (?string $traitValue, bool $result) {
    expect(CollectionTrait::isValidValue($traitValue))->toBe($result);
})->with([
    [null, true],
    ['hello', true],
    ['it is possible to supply multiple', false],
]);
