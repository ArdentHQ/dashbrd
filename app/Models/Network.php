<?php

declare(strict_types=1);

namespace App\Models;

use App\Data\NetworkData;
use App\Enums\Chains;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\LaravelData\WithData;

class Network extends Model
{
    use WithData, HasFactory;

    protected $guarded = [];

    protected $casts = [
        'is_mainnet' => 'boolean',
    ];

    protected string $dataClass = NetworkData::class;

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
    public function scopePolygon(Builder $query): Builder
    {
        return $query->where('chain_id', Chains::Polygon);
    }

    public function chain(): Chains
    {
        return Chains::from($this->chain_id);
    }

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
     * @return Builder<self>
     */
    public static function scopeOnlyActive(): Builder
    {
        return Network::when(app()->environment('production') || ! config('dashbrd.testnet_enabled'), static fn ($query) => $query->onlyMainnet());
    }

    /**
     * @return array<int, int>
     */
    public static function activeChainIds(): array
    {
        return Network::onlyActive()->get()->map(fn ($network) => $network->chain_id)->all();
    }
}
