<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\TradingVolume;

it('belongs to the collection', function () {
    $collection = Collection::factory()->create();

    $volume = TradingVolume::factory()->create([
        'collection_id' => $collection->id,
    ]);

    expect($volume->collection->is($collection))->toBeTrue();
});
