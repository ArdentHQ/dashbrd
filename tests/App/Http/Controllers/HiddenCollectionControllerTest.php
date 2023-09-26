<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Nft;
use App\Support\Facades\Signature;

describe('user without a signed wallet', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->andReturn(false);
    });

    it('cannot hide a collection for the user', function () {
        $user = createUser();
        $collection = Collection::factory()->create();

        Nft::factory()->create([
            'collection_id' => $collection->id,
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->post(route('hidden-collections.store', $collection))
            ->assertRedirect();

        expect($user->hiddenCollections()->get()->contains($collection))->not()->toBeTrue();
    });


});

describe('user with a signed wallet', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->andReturn(true);
    });

    it('can hide a collection for the user', function () {
        $user = createUser();

        $collection = Collection::factory()->create();

        Nft::factory()->create([
            'collection_id' => $collection->id,
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->post(route('hidden-collections.store', $collection))
            ->assertStatus(302);

        expect($user->hiddenCollections()->get()->contains($collection))->toBeTrue();
    });

    it('cannot hide a collection that belong to somebody else', function () {
        $user = createUser();

        $collection = Collection::factory()->create();

        Nft::factory()->create([
            'collection_id' => $collection->id,
        ]);

        $this->actingAs($user)
            ->post(route('hidden-collections.store', $collection))
            ->assertStatus(404);

        expect($user->hiddenCollections->contains($collection))->toBeFalse();
    });

    it('prevents guests from hiding a collection', function () {
        $collection = Collection::factory()->create();

        $this->post(route('hidden-collections.store', $collection))
            ->assertStatus(302);
    });

    it('can show a collection for the user', function () {
        $user = createUser();

        $collection = Collection::factory()->create();

        $user->hiddenCollections()->attach($collection);

        Nft::factory()->create([
            'collection_id' => $collection->id,
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->delete(route('hidden-collections.destroy', $collection))
            ->assertStatus(302);

        expect($user->hiddenCollections()->get()->contains($collection))->toBeFalse();
    });

    it('prevents guests from showing a collection', function () {
        $collection = Collection::factory()->create();

        $this->delete(route('hidden-collections.destroy', $collection))
            ->assertStatus(302);
    });

    it('cannot show a collection that belong to somebody else', function () {
        $user = createUser();

        $collection = Collection::factory()->create();

        $user->hiddenCollections()->attach($collection);

        Nft::factory()->create([
            'collection_id' => $collection->id,
        ]);

        $this->actingAs($user)
            ->delete(route('hidden-collections.destroy', $collection))
            ->assertStatus(404);

        expect($user->hiddenCollections()->get()->contains($collection))->toBeTrue();
    });

});
