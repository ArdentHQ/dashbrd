<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\User;

it('can get all collections that can be nominated', function () {
    $user = User::factory()->create();

    Collection::factory(3)->create();

    $this->actingAs($user)
        ->get(route('nominatable-collections'))
        ->assertOk();
});
