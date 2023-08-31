<?php

declare(strict_types=1);

use App\Support\Facades\Coingecko;
use Illuminate\Support\Facades\Storage;

it('dumps price history', function () {
    Coingecko::fake([
        'https://api.coingecko.com/api/v3/coins/*' => Coingecko::response(fixtureData('coingecko.market_chart'), 200),
    ]);

    $fakeFileSystem = Storage::fake('live-dump');

    $liveDumps = collect([
        'token_price_history.json',
    ]);

    $liveDumps->each(fn ($liveDump) => expect($fakeFileSystem->exists($liveDump))->toBeFalse());

    $this->artisan('tokens:live-dump-price-history');

    $liveDumps->each(fn ($liveDump) => expect($fakeFileSystem->exists($liveDump))->toBeTrue());
});
