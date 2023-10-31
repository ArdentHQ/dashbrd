<?php

declare(strict_types=1);

namespace App\Data;

use App\Models\Token;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\PaginatedDataCollection;
use Spatie\TypeScriptTransformer\Attributes\LiteralTypeScriptType;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
class TokenListItemData extends Data
{
    /**
     * @var array<string>
     */
    private static $sortByOptions = [
        'symbol',
        'fiat_balance',
        'token_price',
        'total_market_cap',
        'total_volume',
    ];

    public function __construct(
        public ?int $guid,
        public string $name,
        public string $symbol,
        public ?string $token_price,
        public string $address,
        public bool $is_native_token,
        public string $balance,
        public int $decimals,
        #[LiteralTypeScriptType('App.Enums.Chain')]
        public int $chain_id,
        public int $network_id,
        public ?string $minted_supply,
        public ?string $total_market_cap,
        public ?string $ath,
        public ?string $atl,
        public ?string $total_volume,
        public ?string $fiat_balance,
        public ?string $price_change_24h_in_currency,
        public ?string $website_url,
        public ?string $twitter_url,
        public ?string $discord_url,
        public string $explorer_url,
        public ?string $logo_url,
        public string $percentage,
    ) {
    }

    /**
     * @param  Collection<int, int>  $chainIds
     * @return PaginatedDataCollection<int, TokenListItemData>
     */
    public static function paginated(User $user, int $perPage, int $currentPage = null, string $sortBy, string $sortDirection, Collection $chainIds): PaginatedDataCollection
    {
        $sortBy = in_array($sortBy, self::$sortByOptions) ? $sortBy : 'fiat_balance';

        $sortDirection = strtolower($sortDirection) === 'desc' ? 'desc' : 'asc';

        $nullDirection = $sortDirection === 'desc' ? 'NULLS LAST' : 'NULLS FIRST';

        $userCurrency = $user->currency();

        $items = DB::select(get_query('tokens.get_list', [
            'walletId' => $user->wallet_id,
            'currency' => $userCurrency->canonical(),
            'limit' => $perPage,
            'offset' => $currentPage ? ($currentPage - 1) * $perPage : 0,
            'chainIds' => $chainIds->join(','),
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection,
            'nullDirection' => $nullDirection,
        ]));

        $total = DB::select(get_query('tokens.get_list_count', [
            'walletId' => $user->wallet_id,
            'chainIds' => $chainIds->join(','),
        ]))[0]->item_count;

        if (empty($items)) {
            /** @var PaginatedDataCollection<int, TokenListItemData> */
            return self::collection(self::fallbackTokens($perPage));
        }

        $paginated = new LengthAwarePaginator(
            items: $items,
            total: $total,
            perPage: $perPage,
            currentPage: $currentPage,
            options: [
                'path' => route('tokens.list'),
            ]
        );

        /** @var PaginatedDataCollection<int, TokenListItemData> */
        return self::collection($paginated);
    }

    /**
     * @return LengthAwarePaginator<TokenListItemData>
     */
    private static function fallbackTokens(int $perPage): LengthAwarePaginator
    {
        $maticToken = Token::matic()->firstOrFail();

        return new LengthAwarePaginator(
            items: [
                new self(
                    guid: $maticToken->token_guid,
                    name: $maticToken->name,
                    symbol: $maticToken->symbol,
                    token_price: '0',
                    address: $maticToken->address,
                    is_native_token: true,
                    balance: '0',
                    decimals: $maticToken->decimals,
                    chain_id: $maticToken->network->chain_id,
                    network_id: $maticToken->network->id,
                    minted_supply: null,
                    total_market_cap: null,
                    ath: null,
                    atl: null,
                    total_volume: null,
                    fiat_balance: '0',
                    price_change_24h_in_currency: null,
                    website_url: null,
                    twitter_url: null,
                    discord_url: null,
                    explorer_url: sprintf('%s/token/%s', $maticToken->network->explorer_url, $maticToken->address),
                    logo_url: $maticToken->images()['large'],
                    percentage: '0',
                ),
            ],
            total: 1,
            perPage: $perPage,
        );
    }
}
