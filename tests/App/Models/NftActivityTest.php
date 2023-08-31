<?php

declare(strict_types=1);

use App\Models\Nft;
use App\Models\NftActivity;

it('belongs to a nft', function () {
    $activity = NftActivity::factory()->create();

    expect($activity->nft)->toBeinstanceOf(Nft::class);
});
