<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Network;
use App\Models\Token;
use App\Models\User;

it('can get all collections that can be nominated', function () {
    Token::factory()->matic()->create();

    $network = Network::polygon();

    $user = User::factory()->create();

    Collection::factory(3)->for($network)->create();

    $this->actingAs($user)
        ->get(route('nominatable-collections'))
        ->assertOk();
});
