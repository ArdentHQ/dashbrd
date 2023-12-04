<?php

declare(strict_types=1);

use App\Models\Collection;

it('opens the collection of the month page', function () {
    $this->get(route('collection-of-the-month'))->assertOk();
});

it('prevents having a collection with `collection-of-the-month` as slug', function () {
    $collection = Collection::factory()->create(['name' => 'Collection Of The Month']);

    expect($collection->slug)->toBe('collection-of-the-month-collection');

    $collection2 = Collection::factory()->create(['name' => 'Collection Of The Month']);

    expect($collection2->slug)->toBe('collection-of-the-month-collection-1');
});
