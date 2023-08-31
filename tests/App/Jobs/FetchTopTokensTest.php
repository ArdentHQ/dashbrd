<?php

declare(strict_types=1);

use App\Jobs\FetchTokenByCoingeckoId;
use App\Jobs\FetchTopTokens;
use App\Jobs\Middleware\RateLimited;
use App\Services\MarketData\Providers\CoingeckoProvider;
use Illuminate\Support\Facades\Bus;

it('should call the job for every token id', function () {
    $this->mock(CoingeckoProvider::class, function ($mock) {
        $mock->shouldReceive('getJobMiddleware')->andReturn([]);

        $mock->shouldReceive('topTokenIds')->andReturn([
            'ethereum',
            'binancecoin',
            'tether',
        ]);
    });

    Bus::fake(FetchTokenByCoingeckoId::class);

    (new FetchTopTokens)->handle(app(CoingeckoProvider::class));

    Bus::assertDispatched(FetchTokenByCoingeckoId::class, 3);
});

it('should have middlewares', function () {
    $middlewares = (new FetchTopTokens())->middleware();

    expect($middlewares)->toHaveCount(1);
    expect($middlewares[0])->toBeInstanceOf(RateLimited::class);
});
