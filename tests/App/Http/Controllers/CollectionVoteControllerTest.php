<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Support\Facades\Signature;

describe('user without a signed wallet', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->andReturn(false);
    });

    it('cannot vote', function () {
        $user = createUser();
        $collection = Collection::factory()->create();

        expect($collection->votes()->count())->toBe(0);

        $this->actingAs($user)->post(route('collection-votes.create', $collection))->assertRedirect();

        expect($collection->votes()->count())->toBe(0);
    });
});

describe('user with a signed wallet', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->andReturn(true);
    });

    it('can vote for a collection', function () {
        $user = createUser();
        $collection = Collection::factory()->create();

        expect($collection->votes()->count())->toBe(0);

        $this->actingAs($user)->post(route('collection-votes.create', $collection));

        expect($collection->votes()->count())->toBe(1);
    });

});
