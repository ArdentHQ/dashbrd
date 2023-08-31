<?php

declare(strict_types=1);

use App\Jobs\FetchTokenByCoingeckoId;
use App\Jobs\LiveDumpTokenData;
use App\Jobs\Middleware\RateLimited;
use App\Models\Token;
use App\Support\Facades\Coingecko;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

it('should store token details and call queue a job to get details', function () {
    Bus::fake(LiveDumpTokenData::class);

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/matic-network?*' => Http::response(fixtureData('coingecko.coins_matic'), 200),
    ]);

    expect(Token::count())->toBe(0);

    FetchTokenByCoingeckoId::dispatch('matic-network');

    // data length is 2, 1 for polygon network and 1 for ethereum network
    Bus::assertDispatched(LiveDumpTokenData::class, fn ($job) => count($job->data) === 2);
});

it('should handle case no platform details', function () {
    Bus::fake(LiveDumpTokenData::class);

    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/bitcoin?*' => Http::response(fixtureData('coingecko.coins_bitcoin'), 200),
    ]);

    expect(Token::count())->toBe(0);

    FetchTokenByCoingeckoId::dispatch('bitcoin');

    expect(Token::count())->toBe(0);

    Bus::assertNotDispatched(LiveDumpTokenData::class);
});

it('should have middlewares', function () {
    $middlewares = (new FetchTokenByCoingeckoId('matic-network'))->middleware();

    expect($middlewares)->toHaveCount(1);
    expect($middlewares[0])->toBeInstanceOf(RateLimited::class);
});
