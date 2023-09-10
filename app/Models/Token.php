<?php

declare(strict_types=1);

namespace App\Models;

use App\Data\Token\TokenData;
use App\Enums\CurrencyCode;
use App\Models\Traits\BelongsToNetwork;
use App\Models\Traits\BelongsToTokenGuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\WithData;
use Spatie\SchemalessAttributes\Casts\SchemalessAttributes;

class Token extends Model
{
    use BelongsToNetwork;
    use BelongsToTokenGuid;
    use HasFactory;
    use WithData;

    /**
     * @var array<string>
     */
    protected $fillable = [
        'address',
        'network_id',
        'name',
        'symbol',
        'decimals',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_native_token' => 'boolean',
        'is_default_token' => 'boolean',
        'extra_attributes' => SchemalessAttributes::class,
    ];

    protected string $dataClass = TokenData::class;

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopePrioritized(Builder $query): Builder
    {
        $pointsPerWallet = (int) config('dashbrd.tokens.priority_scores.points_per_wallet');

        $activeThreshold = (int) config('dashbrd.wallets.active_threshold');
        $pointsPerActiveWallet = (int) config('dashbrd.tokens.priority_scores.points_per_active_wallet');

        $onlineThreshold = (int) config('dashbrd.wallets.online_threshold');
        $pointsPerOnlineWallet = (int) config('dashbrd.tokens.priority_scores.points_per_online_wallet');

        $pointsPerMarketCap = (int) config('dashbrd.tokens.priority_scores.points_per_market_cap.points');
        $pointsPerMarketCapPer = (int) config('dashbrd.tokens.priority_scores.points_per_market_cap.per');

        return $query
            ->select([
                'tokens.*',
                DB::raw("(
                    (COUNT(DISTINCT wallets.id) * {$pointsPerWallet})
                    + (COALESCE((tokens.extra_attributes -> 'market_data' -> 'market_cap' ->> 'usd')::numeric, 0) / {$pointsPerMarketCapPer} * {$pointsPerMarketCap})
                    + (COUNT(CASE WHEN wallets.last_activity_at IS NOT NULL AND wallets.last_activity_at > '".(now()->subSeconds($activeThreshold + 1))."' THEN wallets.id ELSE NULL END) * {$pointsPerActiveWallet})
                    + (COUNT(CASE WHEN wallets.last_activity_at IS NOT NULL AND wallets.last_activity_at > '".(now()->subSeconds($onlineThreshold + 1))."' THEN wallets.id ELSE NULL END) * {$pointsPerOnlineWallet})
                ) as points"),
            ])
            ->leftJoin('balances', 'balances.token_id', '=', 'tokens.id')
            ->leftJoin('wallets', 'wallets.id', '=', 'balances.wallet_id')
            ->groupBy('tokens.id')
            ->orderBy('points', 'desc');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeBySymbol(Builder $query, string $symbol): Builder
    {
        return $query->where('symbol', $symbol);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeNativeToken(Builder $query): Builder
    {
        return $query->where('is_native_token', true);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeDefaultToken(Builder $query): Builder
    {
        return $query->where('is_default_token', true);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeMainnet(Builder $query): Builder
    {
        return $this->scopeWithoutSpam($query->whereHas('network', function (Builder $query) {
            $query->where('is_mainnet', true);
        }));
    }

    /**
     * @return HasMany<Balance>
     */
    public function balances()
    {
        return $this->hasMany(Balance::class, 'token_id', 'id');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithBalancesOnMainnet(Builder $query): Builder
    {
        return $query->mainnet()->has("balances");
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeWithoutSpam(Builder $query): Builder
    {
        return $query->doesntHave('spamToken');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeMatic(Builder $query): Builder
    {
        return $query
            ->bySymbol('MATIC')
            ->whereHas('network', function (Builder $query) {
                /** @var Builder<\App\Models\Network> $query */
                $query->polygon();
            });
    }

    /**
     * @return HasMany<TokenPrice>
     */
    public function tokenPrices(): HasMany
    {
        return $this->hasMany(TokenPrice::class, 'token_guid', 'token_guid');
    }

    /**
     * @return Builder<TokenPriceHistory>
     */
    public function priceHistory(): Builder
    {
        return TokenPriceHistory::where('token_guid', $this->tokenGuid?->guid);
    }

    /**
     * @return HasOne<SpamToken>
     */
    public function spamToken(): HasOne
    {
        return $this->hasOne(SpamToken::class);
    }

    /**
     * @param array{
     *  market_data: array{
     *    ath: array<string, float|null>,
     *    atl: array<string, float|null>,
     *    minted_supply: float|null,
     *  }
     * } $tokenDetails
     */
    public function setTokenDetails(array $tokenDetails): void
    {
        $this->extra_attributes->set('market_data', Arr::get($tokenDetails, 'market_data'));
        $this->extra_attributes->set('images', Arr::get($tokenDetails, 'images'));
        $this->extra_attributes->set('socials', Arr::get($tokenDetails, 'socials'));
    }

    /**
     * @return array{
     *   thumb: string|null,
     *   small: string|null,
     *   large: string|null,
     * }
     */
    public function images(): array
    {
        return [
            'thumb' => $this->extra_attributes->get('images.thumb'),
            'small' => $this->extra_attributes->get('images.small'),
            'large' => $this->extra_attributes->get('images.large'),
        ];
    }

    public function marketCap(CurrencyCode $currency = CurrencyCode::USD): ?float
    {
        $marketCaps = $this->extra_attributes->get('market_data.market_cap', []);

        return $marketCaps[$currency->canonical()] ?? null;
    }

    public function volume(CurrencyCode $currency = CurrencyCode::USD): ?float
    {
        $volumes = $this->extra_attributes->get('market_data.total_volume', []);

        return $volumes[$currency->canonical()] ?? null;
    }

    /**
     * @return array{
     *   discord: string|null,
     *   website: string|null,
     *   twitter: string|null,
     * }
     */
    public function socials(): array
    {
        return $this->extra_attributes->get('socials') ?? [
            'website' => null,
            'discord' => null,
            'twitter' => null,
        ];
    }

    /**
     * @return array{
     *   market_cap: string,
     *   total_volume: string,
     *   minted_supply: string|null,
     *   ath: string,
     *   atl: string,
     * }
     */
    public function marketData(CurrencyCode $currency = CurrencyCode::USD): array
    {
        $data = $this->extra_attributes->get('market_data');

        $resolve = fn ($key) => $data[$key][$currency->canonical()] ?? $data[$key][CurrencyCode::USD->canonical()] ?? null;

        return [
            'market_cap' => $resolve('market_cap'),
            'total_volume' => $resolve('total_volume'),
            'minted_supply' => $data['minted_supply'] ?? null,
            'ath' => $resolve('ath'),
            'atl' => $resolve('atl'),
        ];
    }
}
