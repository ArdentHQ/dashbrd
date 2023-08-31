<?php

declare(strict_types=1);

use App\Enums\Period;
use App\Http\Client\MarketData\Data\CoingeckoMarketChart;
use App\Models\CoingeckoToken;
use App\Support\Facades\Coingecko;

it('can get the price history for different periods', function ($period, $expectedDays) {
    $coingeckoToken = CoingeckoToken::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'coingecko_id' => 'matic-network',
    ]);

    Coingecko::shouldReceive('lookupByToken')->andReturn($coingeckoToken);

    Coingecko::shouldReceive('marketChart')
        ->once()
        ->withArgs(function ($id, $vsCurrency, $days) use ($expectedDays) {
            return $id === 'matic-network' && $vsCurrency === 'USD' && $days === $expectedDays;
        })
        ->andReturn(
            new CoingeckoMarketChart(fixtureData('coingecko.market_chart'))
        );

    $user = createUser();

    $response = $this->actingAs($user)
        ->post(route('price_history', [
            'token' => 'MATIC',
            'currency' => 'USD',
            'period' => $period,
        ]))
        ->assertSuccessful();

    $prices = $response->json();

    expect($prices)->toBeArray();

    expect($prices)->toHaveCount(289);

    expect($prices[0])->toEqual([
        'timestamp' => 1678836069765,
        'price' => 1.1917424918923705,
    ]);
})->with([
    [Period::DAY->value, 1],
    [Period::WEEK->value, 7],
    [Period::MONTH->value, 30],
    [Period::YEAR->value, 365],
]);

it('can get a sample of the price history', function ($sampleSize) {
    $coingeckoToken = CoingeckoToken::factory()->create([
        'symbol' => 'MATIC',
        'name' => 'Polygon',
        'coingecko_id' => 'matic-network',
    ]);

    Coingecko::shouldReceive('lookupByToken')->andReturn($coingeckoToken);

    Coingecko::shouldReceive('marketChart')
        ->once()
        ->withArgs(function ($id, $vsCurrency, $days) {
            return $id === 'matic-network' && $vsCurrency === 'USD' && $days === 1;
        })
        ->andReturn(
            new CoingeckoMarketChart(fixtureData('coingecko.market_chart'))
        );

    $user = createUser();

    $response = $this->actingAs($user)
        ->post(route('price_history', [
            'token' => 'MATIC',
            'currency' => 'USD',
            'period' => Period::DAY->value,
            'sample' => $sampleSize,
        ]))
        ->assertSuccessful();

    $prices = $response->json();

    expect($prices)->toBeArray();

    expect($prices)->toHaveCount($sampleSize);
})->with([
    20,
    1,
    15,
]);

it('handle case no coingecko id is found', function () {
    $user = createUser();

    $this->actingAs($user)
        ->post(route('price_history', [
            'token' => 'MATIC',
            'currency' => 'USD',
            'period' => Period::DAY->value,
        ]))
        ->assertStatus(404);
});
