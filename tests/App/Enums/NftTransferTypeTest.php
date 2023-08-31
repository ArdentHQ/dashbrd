<?php

declare(strict_types=1);

use App\Enums\NftTransferType;

it('should return the enum from value', function ($value, $expected) {
    expect(NftTransferType::getEnumFromValue($value))->toEqual($expected);
})->with([
    ['LABEL_MINT', NftTransferType::Mint],
    ['LABEL_SALE', NftTransferType::Sale],
    ['LABEL_TRANSFER', NftTransferType::Transfer],
]);

it('should throw an exception when trying to get the enum from an invalid value', function () {
    expect(fn () => NftTransferType::getEnumFromValue('Label_INVALID'))->toThrow(\InvalidArgumentException::class);
});
