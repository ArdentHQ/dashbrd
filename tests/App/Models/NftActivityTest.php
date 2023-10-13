<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Nft;
use App\Models\NftActivity;

it('belongs to a nft', function () {
    $collection = Collection::factory()->create();

    $nft = Nft::factory()->create([
        'collection_id' => $collection->id,
        'token_number' => '1',
    ]);

    $activity = NftActivity::factory()->create([
        'token_number' => '1',
        'collection_id' => $collection->id,
    ]);

    expect($activity->nft->is($nft))->toBeTrue();
});
