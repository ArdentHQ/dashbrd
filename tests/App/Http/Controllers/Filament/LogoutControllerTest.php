<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\DB;

it('should redirect the admin user to homepage on logout', function () {
    $user = User::factory()->create();

    DB::insert(
        'insert into model_has_roles (role_id, model_type, model_id) values (?, ?, ?)',
        [1, 'App\\Models\\User', $user->id]
    );

    $this->post(route('filament.admin.auth.logout'))
        ->assertRedirect(route('galleries'));
});
