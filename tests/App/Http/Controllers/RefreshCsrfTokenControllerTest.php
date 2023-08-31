<?php

declare(strict_types=1);

use Illuminate\Contracts\Session\Session;
use Illuminate\Http\Request;

it('should regenerate a new CSRF token and return an empty JSON response', function () {
    $request = $this->mock(Request::class);

    app()->instance(Request::class, $request);

    $session = $this->mock(Session::class);

    $request->shouldReceive('session')->andReturn($session);

    $session->shouldReceive('regenerateToken')->once();

    $this->getJson(route('refresh-csrf-token'));
});
