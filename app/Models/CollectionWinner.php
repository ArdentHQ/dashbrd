<?php

declare(strict_types=1);

namespace App\Models;

use App\Data\Collections\CollectionOfTheMonthData;
use App\Data\Collections\CollectionWinnersData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection as LaravelCollection;

class CollectionWinner extends Model
{
    use HasFactory;

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'votes' => 'int',
        'month' => 'int',
        'year' => 'int',
        'rank' => 'int',
    ];

    /**
     * @return BelongsTo<Collection, CollectionWinner>
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    /**
     * Ineligible collections are those that have already been announced winners.
     *
     * @return LaravelCollection<int, int>
     */
    public static function ineligibleCollectionIds(): LaravelCollection
    {
        return static::query()
                    ->distinct('collection_id')
                    ->where('rank', 1)
                    ->pluck('collection_id');
    }

    /**
     * @return LaravelCollection<int, CollectionWinnersData>
     */
    public static function getByMonth(): LaravelCollection
    {
        $winners = static::query()
                        ->with('collection', 'collection.floorPriceToken', 'collection.network.nativeToken')
                        ->orderBy('year', 'desc')
                        ->orderBy('month', 'desc')
                        ->get()
                        ->groupBy(fn ($winner) => $winner->month.'-'.$winner->year);

        return $winners->map(function ($winners) {
            $collections = $winners->sortBy('rank')->map(
                fn ($winner) => CollectionOfTheMonthData::fromModel($winner)
            )->values();

            return new CollectionWinnersData(
                year: $winners[0]->year,
                month: $winners[0]->month,
                winners: $collections,
            );
        })->values();
    }

    /**
     * @return LaravelCollection<int, CollectionWinner>
     */
    public static function current(): LaravelCollection
    {
        $previousMonth = now()->subMonth();

        return static::query()
                    ->where('year', $previousMonth->year)
                    ->where('month', $previousMonth->month)
                    ->with('collection', 'collection.floorPriceToken', 'collection.network.nativeToken')
                    ->orderBy('rank', 'asc')
                    ->limit(3)
                    ->get();
    }
}
