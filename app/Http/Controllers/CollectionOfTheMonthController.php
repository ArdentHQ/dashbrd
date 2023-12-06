<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionOfTheMonthData;
use App\Models\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelData\DataCollection;

class CollectionOfTheMonthController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Collections/CollectionOfTheMonth', [
            'collections' => fn () => $this->getCollections(),
            'allowsGuests' => true,
            'title' => fn () => trans('metatags.collections.of-the-month.title'),
        ]);
    }

    /**
     * @return DataCollection<int, CollectionOfTheMonthData>
     */
    private function getCollections(): DataCollection
    {
        $collections = CollectionOfTheMonthData::collection(Collection::query()->inRandomOrder()->limit(3)->get());

        if ($collections->count() === 0) {
            abort(404);
        }

        return $collections;
    }
}
