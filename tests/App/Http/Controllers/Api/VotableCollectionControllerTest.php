<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Network;
use App\Models\Token;
use App\Models\User;

it('can get the votable collections', function () {
    Token::factory()->matic()->create([
        'is_native_token' => true,
    ]);

    $network = Network::polygon();

    $user = User::factory()->create();

    Collection::factory(3)->for($network)->create();

    $this->actingAs($user)
        ->get(route('api:votable-collections'))
        ->assertOk();
});

it('can get the votable collections as a guest', function () {
    Token::factory()->matic()->create([
        'is_native_token' => true,
    ]);

    $network = Network::polygon();

    Collection::factory(3)->for($network)->create();

    $this->get(route('api:votable-collections'))
        ->assertJson([
            'votedCollection' => null
        ]);
});

it('can get the collection that the user has voted for', function () {
    Token::factory()->matic()->create([
        'is_native_token' => true,
    ]);

    $network = Network::polygon();

    $user = createUser();

    $collection = Collection::factory()->for($network)->create();

    $collection->addVote($user->wallet);

    $response = $this->actingAs($user)->get(route('api:votable-collections'));

    expect($response['votedCollection'])->not->toBeNull();
});
