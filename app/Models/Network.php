<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\Chain;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Collection;

class Network extends Model
{
    use HasFactory;

    /**
     * @var string[]
     */
    protected $guarded = [];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'is_mainnet' => 'bool',
    ];

    /**
     * @return HasMany<Token>
     */
    public function tokens(): HasMany
    {
        return $this->hasMany(Token::class);
    }

    /**
     * @return HasOne<Token>
     */
    public function nativeToken(): HasOne
    {
        return $this->hasOne(Token::class)->where('is_native_token', true);
    }

    /**
     * Usually only used for testing purposes to quickly find the Polygon network.
     */
    public static function polygon(): self
    {
        return static::where('chain_id', Chain::Polygon)->firstOrFail();
    }

    public function chain(): Chain
    {
        return Chain::from($this->chain_id);
    }

    /**
     * @return Collection<int, int>
     */
    public static function activeChainIds(): Collection
    {
        return static::onlyActive()->pluck('chain_id');
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOnlyMainnet(Builder $query): Builder
    {
        return $query->where('is_mainnet', true);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeOnlyActive(Builder $query): Builder
    {
        if (app()->isProduction() || ! config('dashbrd.testnet_enabled')) {
            return $query->onlyMainnet();
        }

        return $query;
    }
}
