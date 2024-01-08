<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\VolumeChange;

it('belongs to the collection', function () {
    $collection = Collection::factory()->create();

    $volumeChange = VolumeChange::factory()->create([
        'collection_id' => $collection->id,
    ]);

    expect($volumeChange->collection->is($collection))->toBeTrue();
});
