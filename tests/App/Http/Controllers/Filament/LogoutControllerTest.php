<?php

declare(strict_types=1);

use App\Http\Controllers\Filament\LogoutController;
use App\Models\User;

it('should redirect the admin user to homepage on logout', function () {
    $user = User::factory()->editor()->create();

    $this->actingAs($user)->post(action([LogoutController::class, 'logout']))
        ->assertRedirect(route('galleries'));
});
