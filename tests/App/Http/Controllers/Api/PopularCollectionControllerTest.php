<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Network;
use App\Models\Token;
use App\Models\User;

it('can get the top 6 popular collections', function () {
    Token::factory()->matic()->create([
        'is_native_token' => true,
    ]);

    $network = Network::polygon();

    $user = User::factory()->create();

    Collection::factory(3)->for($network)->create();

    $this->actingAs($user)
        ->get(route('api:popular-collections'))
        ->assertOk();
});
