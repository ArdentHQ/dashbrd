<?php

declare(strict_types=1);

use App\Models\User;
use App\Http\Controllers\Filament\LogoutController;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Filament\Facades\Filament;

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
