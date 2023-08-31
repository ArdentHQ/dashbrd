<?php

declare(strict_types=1);

use App\Enums\Features;
use Laravel\Pennant\Feature;

it('should show the dashboard', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertStatus(200);

    $this->get(route('dashboard'))->assertStatus(200);
});

it('should redirect to galleries if porfolio is disabled', function () {
    Feature::shouldReceive('all')
        ->andReturn([
            Features::Galleries->value => true,
            Features::Collections->value => true,
            Features::Portfolio->value => false,
        ])
        ->shouldReceive('active')
        ->with(Features::Portfolio->value)
        ->andReturn(false)
        ->shouldReceive('active')
        ->with(Features::Galleries->value)
        ->andReturn(true);

    $user = createUser();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('galleries'));
});

it('should redirect to collections if porfolio and galleries are disabled', function () {
    Feature::shouldReceive('all')
        ->andReturn([
            Features::Galleries->value => false,
            Features::Collections->value => true,
            Features::Portfolio->value => false,
        ])
        ->shouldReceive('active')
        ->with(Features::Portfolio->value)
        ->andReturn(false)
        ->shouldReceive('active')
        ->with(Features::Galleries->value)
        ->andReturn(false)
        ->shouldReceive('active')
        ->with(Features::Collections->value)
        ->andReturn(true);

    $user = createUser();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('collections'));
});

it('should redirect to user settings if porfolio, galleries and collections are disabled', function () {
    Feature::shouldReceive('all')
        ->andReturn([
            Features::Galleries->value => false,
            Features::Collections->value => false,
            Features::Portfolio->value => false,
        ])
        ->shouldReceive('active')
        ->with(Features::Portfolio->value)
        ->andReturn(false)
        ->shouldReceive('active')
        ->with(Features::Galleries->value)
        ->andReturn(false)
        ->shouldReceive('active')
        ->with(Features::Collections->value)
        ->andReturn(false);

    $user = createUser();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('settings.general'));
});
