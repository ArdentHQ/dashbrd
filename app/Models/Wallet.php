<?php

declare(strict_types=1);

namespace App\Models;

use App\Data\Wallet\WalletData;
use App\Jobs\FetchEnsDetails;
use App\Jobs\FetchNativeBalances;
use App\Jobs\FetchTokens;
use App\Jobs\FetchUserNfts;
use App\Models\Traits\BelongsToUser;
use App\Models\Traits\HasBalances;
use App\Support\Queues;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\WithData;
use Spatie\SchemalessAttributes\Casts\SchemalessAttributes;

class Wallet extends Model
{
    /** @use WithData<WalletData> */
    use BelongsToUser, HasBalances, HasFactory, SoftDeletes, WithData;

    protected string $dataClass = WalletData::class;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'address',
        'domain',
        'avatar',
        'active',
        'total_usd',
        'last_signed_at',
        'last_activity_at',
        'onboarded_at',
        'is_refreshing_collections',
        'refreshed_collections_at',
        'owns_erc1155_tokens_eth',
        'owns_erc1155_tokens_polygon',
    ];

    protected $casts = [
        'owns_erc1155_tokens_eth' => 'bool',
        'owns_erc1155_tokens_polygon' => 'bool',
        'extra_attributes' => SchemalessAttributes::class,
        'total_usd' => 'float',
        'last_activity_at' => 'datetime',
        'last_signed_at' => 'datetime',
        'onboarded_at' => 'datetime',
        'is_refreshing_collections' => 'bool',
        'refreshed_collections_at' => 'datetime',
    ];

    public static function findByAddress(string $address): ?self
    {
        return Wallet::where('address', $address)->first();
    }

    /**
     * @return HasMany<CollectionVote>
     */
    public function votes(): HasMany
    {
        return $this->hasMany(CollectionVote::class);
    }

    /**
     * @return HasOne<WalletAddressDetails>
     */
    public function details(): HasOne
    {
        return $this->hasOne(WalletAddressDetails::class, 'address', 'address');
    }

    /**
     * @return HasMany<Nft>
     */
    public function nfts(): HasMany
    {
        return $this->hasMany(Nft::class);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeRecentlyActive(Builder $query): Builder
    {
        /**
         * @var int $activeThreshold
         */
        $activeThreshold = config('dashbrd.wallets.active_threshold');

        return $query->whereNotNull('last_activity_at')

        ->where('last_activity_at', '>', now()->subSeconds($activeThreshold + 1));
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeHasBeenSigned(Builder $query): Builder
    {
        return $query->whereNotNull('last_signed_at');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeNotRecentlyActive(Builder $query): Builder
    {
        /**
         * @var int $activeThreshold
         */
        $activeThreshold = config('dashbrd.wallets.active_threshold');

        return $query->whereNull('last_activity_at')
            ->orWhere('last_activity_at', '<=', now()->subSeconds($activeThreshold + 1));
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOnline(Builder $query): Builder
    {
        /**
         * @var int $onlineThreshold
         */
        $onlineThreshold = config('dashbrd.wallets.online_threshold');

        return $query->whereNotNull('last_activity_at')
            ->where('last_activity_at', '>', now()->subSeconds($onlineThreshold + 1));
    }

    /**
     * @return HasManyThrough<Token>
     */
    public function tokens(): HasManyThrough
    {
        return $this->hasManyThrough(
            Token::class,
            Balance::class,
            firstKey: 'wallet_id',
            secondKey: 'id',
            localKey: 'id',
            secondLocalKey: 'token_id'
        );
    }

    public function findBalance(Token $token): ?Balance
    {
        return Balance::firstWhere([
            'wallet_id' => $this->id,
            'token_id' => $token->id,
        ]);
    }

    public function totalBalanceInCurrency(): string
    {
        $result = DB::select(get_query('wallet.calculate_total_balance', [
            'walletId' => $this->id,
            'currency' => $this->user->currency()->canonical(),
            'networkIds' => implode(',', Network::onlyActive()->pluck('id')->toArray()),
        ]));

        return $result[0]->total_balance;
    }

    public function totalTokens(): int
    {
        return $this
            ->balances()
            ->whereHas('token', function ($query) {
                $query->whereIn('network_id', Network::onlyActive()->pluck('id')->toArray());
            })
            ->doesntHave('token.spamToken')
            ->count();
    }

    public function isLocalTestingAddress(): bool
    {
        return $this->address === config('dashbrd.testing_wallet');
    }

    public function dispatchIndexingJobs(Network $network, ?bool $onPriorityQueue = false): void
    {
        FetchEnsDetails::dispatch($this)
            ->afterCommit()
            ->onQueue($onPriorityQueue ? Queues::PRIORITY : Queues::DEFAULT);

        FetchNativeBalances::dispatch($this, $network)
            ->afterCommit()
            ->onQueue($onPriorityQueue ? Queues::PRIORITY : Queues::DEFAULT);

        FetchTokens::dispatch($this, $network)
            ->afterCommit()
            ->onQueue($onPriorityQueue ? Queues::PRIORITY : Queues::DEFAULT);

        $batch = Bus::batch([
            (new FetchUserNfts($this->user_id, $network))->afterCommit(),
        ]);

        $batch->onQueue($onPriorityQueue ? Queues::PRIORITY : Queues::NFTS);

        $walletId = $this->id;

        $batch->name('Onboarding Wallet #'.$walletId)->finally(function () use ($walletId) {
            Wallet::findOrFail($walletId)->touchQuietly('onboarded_at');
        })->dispatch();
    }

    public function tokensFetchedAt(): ?Carbon
    {
        return $this->getExtraAttributeTimestamp('tokens_fetched_at');
    }

    public function nativeBalancesFetchedAt(): ?Carbon
    {
        return $this->getExtraAttributeTimestamp('native_balances_fetched_at');
    }

    private function getExtraAttributeTimestamp(string $key): ?Carbon
    {
        $dateAsString = $this->extra_attributes->get($key);

        if ($dateAsString === null) {
            return null;
        }

        return Carbon::parse($dateAsString);
    }

    public function onboarded(): bool
    {
        return $this->onboarded_at !== null;
    }

    public function canRefreshCollections(): bool
    {
        if ($this->is_refreshing_collections) {
            return false;
        }

        if ($this->refreshed_collections_at === null) {
            return true;
        }

        return $this->refreshed_collections_at->lt(
            now()->subMinutes(15)
        );
    }
}
