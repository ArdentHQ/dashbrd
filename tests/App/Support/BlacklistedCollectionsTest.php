<?php

declare(strict_types=1);

use App\Support\BlacklistedCollections;

it('can determine whether a collection is blacklisted', function () {
    config(['dashbrd.blacklisted_collections' => [
        'address-123',
        'address-456',
        'ADDRESS-900',
    ]]);

    expect(BlacklistedCollections::includes('address-123'))->toBeTrue();
    expect(BlacklistedCollections::includes('ADDRESS-123'))->toBeTrue();
    expect(BlacklistedCollections::includes('address-900'))->toBeTrue();
    expect(BlacklistedCollections::includes('address-678'))->toBeFalse();
});
