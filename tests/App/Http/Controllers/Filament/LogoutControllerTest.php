<?php

declare(strict_types=1);

use App\Models\User;

it('should redirect the admin user to homepage on logout', function () {
    $user = User::factory()->editor()->create();

    $this->actingAs($user)->post(route('filament.admin.auth.logout'))
        ->assertRedirect(route('galleries'));
});
