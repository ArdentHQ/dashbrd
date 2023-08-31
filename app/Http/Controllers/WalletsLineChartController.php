<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\MarketDataProvider;
use App\Data\PriceHistoryData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Rules\ValidCurrencyCode;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Spatie\LaravelData\DataCollection;

class WalletsLineChartController extends Controller
{
    /**
     * @return  Collection<string, DataCollection<int, PriceHistoryData>>
     */
    public function __invoke(Request $request, MarketDataProvider $provider): Collection
    {
        $request->validate([
            'symbols' => ['required', 'string'],
            'currency' => ['required', new ValidCurrencyCode()],
        ]);

        $tokens = collect(explode(',', $request->get('symbols')))
            ->map(fn ($symbol) => trim($symbol))
            ->filter()
            ->toArray();

        $tokens = $request->user()->wallet
            ->tokens()
            ->mainnet()
            ->whereIn('symbol', $tokens)
            ->get();

        return $provider->getBatchPriceHistory(
            tokens: $tokens,
            currency: CurrencyCode::from(strtoupper($request->currency)),
            period: Period::from(config('dashbrd.wallets.line_chart.period')),
            sampleCount: config('dashbrd.wallets.line_chart.sample_count'),
        );
    }
}
