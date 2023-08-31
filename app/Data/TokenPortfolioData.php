<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\Token;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TokenPortfolioData extends Data
{
    public function __construct(
        public string $name,
        public string $symbol,
        public ?string $balance,
        public ?string $decimals,
        public string $fiat_balance,
        public string $percentage,
    ) {
    }

    /**
     * @param  array<int>  $networkIds
     * @return DataCollection<int, TokenPortfolioData>
     */
    public static function breakdown(User $user, int $topCount, array $networkIds): DataCollection
    {
        $userCurrency = $user->currency();

        $result = DB::select(get_query('tokens.get_portfolio_data', [
            'walletId' => $user->wallet_id,
            'topCount' => $topCount,
            'currency' => $userCurrency->canonical(),
            'networkIds' => implode(',', $networkIds),
        ]));

        if (empty($result)) {
            /** @var DataCollection<int, TokenPortfolioData> */
            return self::collection([self::fallbackToken()]);
        }

        /** @var DataCollection<int, TokenPortfolioData> */
        return self::collection($result);
    }

    private static function fallbackToken(): self
    {
        $maticToken = Token::matic()->firstOrFail();

        return new self(
            name: $maticToken->name,
            symbol: $maticToken->symbol,
            balance: '0',
            decimals: (string) $maticToken->decimals,
            fiat_balance: '0',
            percentage: '0',
        );
    }
}
