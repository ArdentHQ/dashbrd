<?php

declare(strict_types=1);

use App\Exceptions\ConnectionException;
use App\Exceptions\RateLimitException;
use App\Support\Facades\Coingecko;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

it('should return null on 404 when requesting token details', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/*' => Http::response(null, 404),
    ]);

    $data = Coingecko::token('bitcoin');
    expect($data)->toBeNull();
});

it('should throw any non-404 error when requesting token details', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/*' => Http::response(null, 400),
    ]);
    expect(fn () => Coingecko::token('bitcoin'))->toThrow('400 Bad Request');
});

it('should accept api key', function () {
    Config::set('services.coingecko.key', 'secret');

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/*' => function ($request) {
            expect($request->hasHeader('x-cg-pro-api-key'))->toBeTrue();

            return Http::response([]);
        },
    ]);

    Coingecko::token('bitcoin');
});

it('throws rate limit exceptions on 429 errors', function () {
    Coingecko::fake(Http::response('', 429, [
        'Retry-After' => '10',
    ]));

    Coingecko::token('bitcoin');
})->throws(RateLimitException::class);

it('throws rate limit exceptions on server errors', function () {
    Coingecko::fake(Http::response('', 500));

    Coingecko::token('bitcoin');
})->throws(ConnectionException::class);
