<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CoingeckoPlatform;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CoingeckoToken extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * @var string[]
     */
    protected $observables = ['trashed'];

    protected $fillable = [
        'name',
        'symbol',
        'coingecko_id',
    ];

    public static function lookupByToken(Token $token, bool $withTrashed = false): ?CoingeckoToken
    {
        $platform = CoingeckoPlatform::tryFromChainId($token->network->chain_id);

        // Determine coingecko_id for the given $token
        //
        // Coin lookup order:
        // - by guid
        // - by (platform, address)
        // - by name and symbol combination

        $lookups = [
            fn (Builder $query) => $query->whereExists(function ($sub) use ($token) {
                $sub->select(DB::raw(1))
                    ->from('token_guids')
                    ->whereRaw('token_guids.guid = coingecko_tokens.coingecko_id')
                    ->where('token_guids.id', $token['token_guid']);
            }),
            $platform !== null
                ? fn (Builder $query) => $query->whereJsonContains('platforms', [$platform->value => $token['address']])
                : null,
            fn (Builder $query) => $query->where('symbol', $token['symbol'])->where('name', $token['name']),
        ];

        $candidates = collect();
        foreach ($lookups as $lookup) {
            $result = self::tryLookup($lookup, $withTrashed);
            if ($result->isEmpty()) {
                continue;
            }

            // still have fallbacks, so continue
            $candidates = $result;

            // either we get a single result or duplicates and if this is the last lookup,
            // return the first match either way.
            if ($result->count() === 1 || Arr::last($lookups) === $lookup) {
                break;
            }
        }

        if (! $candidates->isEmpty()) {
            return $candidates->first();
        }

        return null;
    }

    /**
     * @param  ?callable  $conditionBuilder
     * @param  ?bool  $withTrashed
     * @return Collection<int, CoingeckoToken>
     */
    private static function tryLookup(?callable $conditionBuilder, ?bool $withTrashed): Collection
    {
        if ($conditionBuilder === null) {
            return collect();
        }

        $query = self::select();
        $conditionBuilder($query);

        if ($withTrashed) {
            $query = $query->withTrashed();
        }

        return $query
            ->orderBy('duplicated', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
