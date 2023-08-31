<?php

declare(strict_types=1);

use App\Enums\Period;
use App\Jobs\FetchPriceHistory;
use App\Models\Network;
use App\Models\Token;
use App\Models\User;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for every token and user currency in the database', function () {
    Bus::fake();

    $network = Network::factory()->create(['is_mainnet' => true]);

    Token::factory()
                ->count(3)
                ->withGuid()
                ->for($network)
                ->create();

    // Adding 3 users with 2 different currencies
    User::factory()->create(['extra_attributes' => ['currency' => 'MXN']]);
    User::factory()->create(['extra_attributes' => ['currency' => 'EUR']]);
    User::factory()->create(['extra_attributes' => ['currency' => 'MXN']]);

    $this->artisan('marketdata:fetch-price-history --period='.Period::DAY->value);

    // Should dispatch the job for 3 tokens * (2 user currencies + 1 default currency
    // that is always added (USD))
    Bus::assertDispatchedTimes(FetchPriceHistory::class, 9);
});

it('returns an error if invalid period', function () {
    $response = $this->artisan('marketdata:fetch-price-history --period=wrong');

    $response->expectsOutput('Invalid period');
});
