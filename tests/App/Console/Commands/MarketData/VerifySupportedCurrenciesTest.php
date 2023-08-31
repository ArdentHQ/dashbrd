<?php

declare(strict_types=1);

use App\Jobs\VerifySupportedCurrencies;
use Illuminate\Support\Facades\Bus;

it('dispatches a job', function () {
    Bus::fake();

    $this->artisan('marketdata:verify-supported-currencies');

    Bus::assertDispatched(VerifySupportedCurrencies::class);
});
