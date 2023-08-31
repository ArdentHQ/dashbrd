<?php

declare(strict_types=1);

use App\Support\Visitor;
use Illuminate\Http\Request;

it('detects european based on ipcountry header', function () {
    $this->mock(Request::class)->shouldReceive('header')->with('cf-ipcountry', 'AT')->andReturn('ES');

    expect(Visitor::isEuropean(app(Request::class)))->toBe(true);
});

it('detects non european based on ipcountry header', function () {
    $this->mock(Request::class)->shouldReceive('header')->with('cf-ipcountry', 'AT')->andReturn('MX');

    expect(Visitor::isEuropean(app(Request::class)))->toBe(false);
});
