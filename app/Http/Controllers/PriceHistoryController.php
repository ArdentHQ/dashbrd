<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\MarketDataProvider;
use App\Data\PriceHistoryData;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use App\Models\Token;
use App\Rules\ValidCurrencyCode;
use App\Rules\ValidPeriod;
use App\Rules\ValidTokenSymbol;
use Illuminate\Http\Request;
use Spatie\LaravelData\DataCollection;
use Throwable;

class PriceHistoryController extends Controller
{
    /**
     * @return DataCollection<int, PriceHistoryData>
     */
    public function __invoke(Request $request, MarketDataProvider $provider): DataCollection
    {
        $request->validate([
            'token' => ['required', new ValidTokenSymbol()],
            'currency' => ['required', new ValidCurrencyCode()],
            'period' => ['required', new ValidPeriod()],
            'sample' => 'nullable|integer|min:1',
        ]);

        $model = Token::bySymbol($request->token)->firstOrFail();

        try {
            return $provider->getPriceHistory(
                token: $model,
                currency: CurrencyCode::from(strtoupper($request->currency)),
                period: Period::from($request->period),
                sampleCount: $request->has('sample') ? (int) $request->get('sample') : null,
            );
        } catch (Throwable $throwable) {
            report($throwable);

            abort(404);
        }
    }
}
