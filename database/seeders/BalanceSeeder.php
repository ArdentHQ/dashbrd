<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Network;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class BalanceSeeder extends Seeder
{
    public function run(): void
    {
        $wallet = $this->wallet();
        $mainnet = $this->mainnet();

        $tokens = $mainnet->tokens()->whereIn('symbol', config('dashbrd.test_tokens'))->get();

        foreach ($tokens as $token) {
            $wallet->balances()->create([
                'token_id' => $token->id,
                'balance' => random_int(50, 1000) * (pow(10, $token['decimals'])),
            ]);

            $prices = Arr::get($token, 'extra_attributes.market_data.current_prices', []);
            $priceChanges24h = Arr::get($token, 'extra_attributes.market_data.price_change_24h_in_currency', []);

            foreach ($prices as $currency => $price) {
                $priceChange24hInCurrency = $priceChanges24h[$currency] ?? 0;
                $priceChangePercent = 0;

                $diff = $price - $priceChange24hInCurrency;
                if (abs($diff) > PHP_FLOAT_EPSILON) {
                    $priceChangePercent = 100 * ($price / $diff - 1);
                }

                $token->tokenPrices()->where('currency', $currency)->update([
                    'price' => $price,
                    'price_change_24h' => $priceChangePercent,
                ]);
            }
        }
    }

    // Currently we only create 1 full user
    private function wallet(): Wallet
    {
        return Wallet::firstWhere('address', env('LOCAL_TESTING_ADDRESS'));
    }

    private function mainnet(): Network
    {
        return Network::firstWhere('is_mainnet', true);
    }
}
