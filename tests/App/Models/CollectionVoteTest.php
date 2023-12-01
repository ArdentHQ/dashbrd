<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Wallet;

test('collection has many votes', function () {
    $collection = Collection::factory()->create();

    $wallet = Wallet::factory()->create();

    expect($collection->votes()->count())->toBe(0);

    $collection->addVote($wallet);

    expect($collection->votes()->count())->toBe(1);
});
