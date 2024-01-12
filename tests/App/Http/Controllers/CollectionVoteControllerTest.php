<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\CollectionVote;
use App\Support\Facades\Signature;
use Carbon\Carbon;

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

        CollectionVote::factory()->for($collection)->for($user->wallet)->create([
            'voted_at' => now()->subMonth()->subDays(1),
        ]);

        expect($collection->votes()->count())->toBe(1);

        $this->actingAs($user)->post(route('collection-votes.create', $collection));

        expect($collection->votes()->count())->toBe(2);
    });

    it('cannot vote if already voted for a collection in the current month', function () {
        $user = createUser();
        $collection = Collection::factory()->create();

        Carbon::setTestNow('2023-12-20');

        CollectionVote::factory()->for($collection)->for($user->wallet)->create([
            'voted_at' => now()->subDays(3),
        ]);

        expect($collection->votes()->count())->toBe(1);

        $this->actingAs($user)
            ->post(route('collection-votes.create', $collection))
            ->assertStatus(302);

        expect($collection->votes()->count())->toBe(1);
    });

    it('allows users to vote even if they voted a few days ago, but in a previous month', function () {
        $user = createUser();
        $collection = Collection::factory()->create();

        CollectionVote::factory()->for($collection)->for($user->wallet)->create([
            'voted_at' => Carbon::parse('2023-11-30'),
        ]);

        expect($collection->votes()->count())->toBe(1);

        Carbon::setTestNow('2023-12-01');

        $this->actingAs($user)
            ->post(route('collection-votes.create', $collection))
            ->assertStatus(302);

        expect($collection->votes()->count())->toBe(2);
    });
});
