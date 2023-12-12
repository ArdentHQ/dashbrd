<?php

declare(strict_types=1);

it('should render the collections overview page', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get(route('popular-collections'))
        ->assertStatus(200);
});

it('should render the collections overview page as guest', function () {
    $this->get(route('popular-collections'))
        ->assertStatus(200);
});
