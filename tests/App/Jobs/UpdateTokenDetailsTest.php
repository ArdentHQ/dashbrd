<?php

declare(strict_types=1);

use App\Contracts\MarketDataProvider;
use App\Http\Client\MarketData\Data\CoingeckoTokenData;
use App\Jobs\UpdateTokenDetails;
use App\Models\CoingeckoToken;
use App\Models\Network;
use App\Models\Token;
use App\Models\TokenPrice;
use App\Support\Facades\Coingecko;

it('updates the details for a token', function () {
    Coingecko::shouldReceive('token')
        ->once()
        ->with('testy')
        ->andReturn(new CoingeckoTokenData(fixtureData('coingecko.coins_bitcoin')));

    $network = Network::factory()->create(['is_mainnet' => true]);

    $token = Token::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'network_id' => $network->id,
        'extra_attributes' => null,
    ]);

    CoingeckoToken::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'coingecko_id' => 'testy',
    ]);

    expect($token->address)->not()->toBeNull();
    expect($token->extra_attributes->market_data)->toBeNull();

    (new UpdateTokenDetails($token))->handle(app(MarketDataProvider::class));

    expect($token->extra_attributes->market_data)->toBeArray();
    expect($token->extra_attributes->market_data['market_cap']['usd'])->toBe(457405642741);
    expect($token->extra_attributes->market_data['total_volume']['usd'])->toBe(32299852560);

    $usdPrice = TokenPrice::query()->where('currency', '=', 'usd')->firstOrFail();
    expect($usdPrice['price'])->toBe('23636');
});

it('updates the details for a token without prices', function () {
    Coingecko::shouldReceive('token')
        ->once()
        ->with('testy')
        ->andReturn(new CoingeckoTokenData(fixtureData('coingecko.coins_bitcoin_no_prices')));

    $network = Network::factory()->create(['is_mainnet' => true]);

    $token = Token::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'network_id' => $network->id,
        'extra_attributes' => null,
    ]);

    CoingeckoToken::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'coingecko_id' => 'testy',
    ]);

    (new UpdateTokenDetails($token))->handle(app(MarketDataProvider::class));

    expect($token->extra_attributes->market_data)->toBeArray();
    expect($token->extra_attributes->market_data['market_cap']['usd'])->toBe(457405642741);
    expect($token->extra_attributes->market_data['total_volume']['usd'])->toBe(32299852560);

    $usdPrice = TokenPrice::query()->where('currency', '=', 'usd')->first();
    expect($usdPrice)->toBeNull();
});

it('handles missing token gracefully', function () {
    $network = Network::factory()->create(['is_mainnet' => true]);

    $token = Token::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'network_id' => $network->id,
        'extra_attributes' => null,
    ]);

    (new UpdateTokenDetails($token))->handle(app(MarketDataProvider::class));
    $this->assertTrue(true);
});

it('handles missing token gracefully when model exists and soft deletes', function () {
    Coingecko::shouldReceive('token')
        ->once()
        ->andReturn(null);

    $network = Network::factory()->create(['is_mainnet' => true]);

    $token = Token::factory()->withGuid('testy')->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'network_id' => $network->id,
        'extra_attributes' => null,
    ]);

    $coingeckoToken = CoingeckoToken::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'coingecko_id' => 'testy',
    ]);
    expect(! $coingeckoToken->trashed());
    $this->assertDatabaseCount('spam_tokens', 0);
    expect($token->refresh()->spamToken)->toBeNull();

    (new UpdateTokenDetails($token))->handle(app(MarketDataProvider::class));

    expect($coingeckoToken->trashed());
    $this->assertDatabaseCount('spam_tokens', 1);
    expect($token->refresh()->spamToken)
        ->not()
        ->toBeNull()
        ->and($token->spamToken()->getResults()->reason)
        ->toBe('trashed');
});

it('should restore when trashed and reevaluate spam status', function () {
    Coingecko::shouldReceive('token')
        ->once()->with('testy')
        ->andReturn(null);

    $network = Network::factory()->create(['is_mainnet' => true]);

    $token = Token::factory()->withGuid('testy')->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'network_id' => $network->id,
        'extra_attributes' => null,
    ]);

    $coingeckoToken = CoingeckoToken::factory()->create([
        'symbol' => 'TEST',
        'name' => 'test',
        'coingecko_id' => 'testy',
    ]);
    (new UpdateTokenDetails($token))->handle(app(MarketDataProvider::class));

    expect($coingeckoToken->trashed());
    $this->assertDatabaseCount('spam_tokens', 1);

    // now the token exists again
    Coingecko::shouldReceive('token')
        ->once()->with('testy')
        ->andReturn(new CoingeckoTokenData(fixtureData('coingecko.coins_bitcoin_no_prices')));

    (new UpdateTokenDetails($token))->handle(app(MarketDataProvider::class));

    expect(! $coingeckoToken->trashed());
    $this->assertDatabaseCount('spam_tokens', 0);
});

it('should have middlewares', function () {
    $token = Token::factory()->create();

    $middlewares = (new UpdateTokenDetails($token))->middleware();

    expect($middlewares)->toBeArray();
});

it('should have a retry until function', function () {

    $token = Token::factory()->create();

    $retryUntil = (new UpdateTokenDetails($token))->retryUntil();

    expect($retryUntil)->toBeInstanceOf(DateTime::class);
    expect($retryUntil)->toBeGreaterThan(now());
    expect($retryUntil->getTimestamp() - now()->getTimestamp())->toBe(1200);
});
