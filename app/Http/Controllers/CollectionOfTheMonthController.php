<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionWinnersData;
use App\Models\CollectionWinner;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

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
     * @return Collection<int, CollectionWinnersData>
     */
    private function getWinnerColletions(): Collection
    {
        $winners = CollectionWinner::getByMonth();

        abort_if($winners->isEmpty(), 404);

        return $winners;
    }
}
