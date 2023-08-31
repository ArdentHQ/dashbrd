<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\CurrencyPriceData;
use App\Data\Token\TokenData;
use App\Data\Token\TokenPriceData;
use App\Models\Network;
use App\Models\Token;
use App\Models\TokenPrice;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class NativeTokenController extends Controller
{
    public function show(Request $request, Network $network, Token $token): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $userCurrency = $user->currency();

        $nativeToken = Token::where('network_id', $network->id)
            ->where('is_native_token', true)
            ->firstOrFail();

        $tokenPrice = TokenPrice::query()
            ->where('token_guid', $nativeToken->token_guid)
            ->where('currency', $userCurrency->canonical())
            ->first();

        $currencyData = new CurrencyPriceData(
            (float) Arr::get($tokenPrice, 'price', 0),
            (float) Arr::get($tokenPrice, 'price_change_24h', 0),
        );

        return response()->json([
            'token' => TokenData::fromModel($nativeToken),
            'tokenPrice' => new TokenPriceData($tokenPrice->token_guid, [
                $userCurrency->value => $currencyData,
            ]),
        ]);
    }
}
