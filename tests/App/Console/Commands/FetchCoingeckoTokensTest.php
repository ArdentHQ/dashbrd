<?php

declare(strict_types=1);

use App\Jobs\FetchCoingeckoTokens;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for collections', function () {
    Bus::fake();

    Bus::assertDispatchedTimes(FetchCoingeckoTokens::class, 0);

    $this->artisan('tokens:fetch-coingecko-tokens');

    Bus::assertDispatchedTimes(FetchCoingeckoTokens::class, 1);
});
