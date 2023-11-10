<?php

declare(strict_types=1);

use App\Http\Controllers\Filament\LogoutController;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

it('should redirect the admin user to homepage on logout', function () {
    $user = User::factory()->editor()->create();

    Filament::partialMock()
        ->shouldReceive('auth->logout');

    $this->actingAs($user);

    $request = Request::create('/logout', 'GET');
    $request->setLaravelSession(Session::driver());

    $controller = new LogoutController();

    $response = $controller->logout($request);

    $this->assertInstanceOf(RedirectResponse::class, $response);
    $this->assertEquals(route('galleries'), $response->getTargetUrl());
});
