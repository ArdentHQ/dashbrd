<?php

declare(strict_types=1);

use App\Enums\TraitDisplayType;

it('should convert from Alchemy display type', function ($displayType, $expected) {
    expect(TraitDisplayType::fromAlchemyDisplayType($displayType, ''))->toEqual($expected);
})->with([
    'default' => ['whatever', TraitDisplayType::Property],
    'null' => [null, TraitDisplayType::Property],
    'stat' => ['number', TraitDisplayType::Stat],
    'boost_percentage' => ['boost_percentage', TraitDisplayType::BoostPercentage],
]);

it('should infer dates from Alchemy', function ($value, $expected) {
    expect(TraitDisplayType::fromAlchemyDisplayType('something', $value))->toEqual($expected);
})->with([
    '2021-12-13' => ['2021-12-13', TraitDisplayType::Date],
    '2021-10-29 04:11' => ['2021-10-29 04:11', TraitDisplayType::Date],
    '2021-10-29 04:11:32' => ['2021-10-29 04:11:32', TraitDisplayType::Date],
    'not a date' => ['not a date', TraitDisplayType::Property],
    '0' => ['0', TraitDisplayType::Property],
]);

it('should convert from Mnemonic display type', function () {
    collect(TraitDisplayType::cases())->each(fn ($case) => expect(TraitDisplayType::fromMnemonicDisplayType($case->value, ''))->toBe($case));
});

it('should convert date from Mnemonic display type', function (?string $displayType, ?string $value, TraitDisplayType $expected) {
    expect(TraitDisplayType::fromMnemonicDisplayType($displayType, $value))->toBe($expected);
})->with([
    '2021-12-13' => [null, '2021-12-13', TraitDisplayType::Date],
    // existing display type takes precedence
    'with given display type' => [TraitDisplayType::Property->value, '2021-12-13', TraitDisplayType::Property],
    'not a date' => [null, 'asdfg', TraitDisplayType::Property],
    'null' => [null, null, TraitDisplayType::Property],
]);

it('should return whether numeric or not', function (TraitDisplayType $displayType, $expected) {
    expect($displayType->isNumeric())->toBe($expected);
})->with([
    'Property' => [TraitDisplayType::Property, false],
    'Date' => [TraitDisplayType::Date, true],
    'Boost' => [TraitDisplayType::Boost, true],
    'BoostPercentage' => [TraitDisplayType::BoostPercentage, true],
    'Level' => [TraitDisplayType::Level, true],
    'Stat' => [TraitDisplayType::Stat, true],
]);

it('should get value columns', function (TraitDisplayType $displayType, $expected) {
    expect($displayType->getValueColumns('value'))->toEqual($expected);
})->with([
    'Property' => [TraitDisplayType::Property, ['value', null, null]],
    'Date' => [TraitDisplayType::Date, [null, null, 'value']],
    'Boost' => [TraitDisplayType::Boost, [null, 'value', null]],
    'BoostPercentage' => [TraitDisplayType::BoostPercentage, [null, 'value', null]],
    'Level' => [TraitDisplayType::Level, [null, 'value', null]],
    'Stat' => [TraitDisplayType::Stat, [null, 'value', null]],
]);
