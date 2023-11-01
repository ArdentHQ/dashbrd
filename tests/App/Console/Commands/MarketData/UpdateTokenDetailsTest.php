<?php

declare(strict_types=1);

use App\Console\Commands\MarketData\UpdateTokenDetails as UpdateTokenDetailsCommand;
use App\Jobs\UpdateTokenDetails;
use App\Models\Balance;
use App\Models\Network;
use App\Models\Token;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;

it('dispatches a job for every token in the database', function () {
    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    Token::factory()->count(3)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details');

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 3);
});

// @see UpdateTokenDetailsCommand::getLimitPerMinutes for logic behind `expectedAmount`
it('dispatches a job for top tokens in the database', function ($date, $expectedAmount) {
    Carbon::setTestNow($date);

    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    Token::factory()->count(100)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        '--top' => true,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, $expectedAmount);
})->with([
    // [ Date | Expected amount ]
    // Less amount === More jobs running
    [
        // Monday at night (all coingecko-related job runs)
        Carbon::parse('2023-10-30 22:00:00'),

        18,
    ],
    [
        // Monday after 13:00 hrs (fetch price history runs)
        Carbon::parse('2023-10-30 13:00:00'),
        25,
    ],
    [
        // Monday before 13:00 hrs (fetch price history doesnt runs)
        Carbon::parse('2023-10-30 12:00:00'),
        37,
    ],
    [
        // Random day (sunday) at night (verify supported currencies doesnt runs)
        Carbon::parse('2023-10-29 22:00:00'),
        25,
    ],
    [
        // Monday day before 17:00 hrs (update tokens details runs only for top tokens and fetch price history doesnt runs yet)
        Carbon::parse('2023-10-29 16:00:00'),
        // only FetchPriceHistory
        37,
    ],

]);

it('dispatches a job for rest of the tokens', function () { // To ensure all jobs run
    $mondayAtNight = Carbon::parse('2023-10-30 22:00:00');

    Carbon::setTestNow($mondayAtNight);

    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    Token::factory()->count(100)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        '--no-top' => true,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 100 - 18);
});

it('dispatches a job for a single token', function () {
    Bus::fake([UpdateTokenDetails::class]);

    Token::factory()->count(3)->create();

    $network = Network::factory()->create(['is_mainnet' => true]);
    $subject = Token::factory()->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        'token_symbol' => $subject->symbol,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 1);
});

it('dispatches a job for all wallet tokens', function () {
    Bus::fake([UpdateTokenDetails::class]);

    $network = Network::factory()->create(['is_mainnet' => true]);

    $wallet = Wallet::factory()->create();

    Token::factory()->count(1)->create(['network_id' => $network->id]);

    $tokens = Token::factory()->count(3)->create(['network_id' => $network->id]);

    $wallet->balances()->saveMany($tokens->map(static function (Token $token) use ($wallet) {
        return new Balance([
            'wallet_id' => $wallet['id'],
            'token_id' => $token['id'],
            'balance' => '0',
        ]);
    }));

    Token::factory()->count(2)->create(['network_id' => $network->id]);

    $this->artisan('marketdata:update-token-details', [
        '--wallet-id' => $wallet->id,
    ]);

    Bus::assertDispatchedTimes(UpdateTokenDetails::class, 3);
});

it('calculates the total jobs per minute', function () {
    expect((new UpdateTokenDetailsCommand())->getLimitPerMinutes(15))->toBe(25);

    expect((new UpdateTokenDetailsCommand())->getLimitPerMinutes(5))->toBe(8);

    expect((new UpdateTokenDetailsCommand())->getLimitPerMinutes(1))->toBe(1);
});
