<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionOfTheMonthData;
use App\Models\Collection;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelData\DataCollection;

class CollectionOfTheMonthController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Collections/CollectionOfTheMonth', [
            'winners' => fn () => $this->getWinnerColletions(),
            'allowsGuests' => true,
            'title' => fn () => trans('metatags.collections.of-the-month.title', [
                'month' => Carbon::now()->startOfMonth()->subMonth()->format('F Y'),
            ]),
        ]);
    }

    /**
     * @return DataCollection<int, CollectionOfTheMonthData>
     */
    private function getWinnerColletions(): DataCollection
    {

        $winners = CollectionOfTheMonthData::collection(
            Collection::query()
                ->whereNotNull('has_won_at')
                ->get()
                ->sortByDesc('has_won_at')
                ->values()
        );

        if ($winners->count() === 0) {
            abort(404);
        }

        return $winners;
    }
}
