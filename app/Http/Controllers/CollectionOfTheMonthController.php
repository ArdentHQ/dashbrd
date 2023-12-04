<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionOfTheMonthData;
use App\Models\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CollectionOfTheMonthController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Collections/CollectionOfTheMonth', [
            'collections' => fn () => CollectionOfTheMonthData::collection(Collection::query()->inRandomOrder()->limit(3)->get()),
            'allowsGuests' => true,
            'title' => fn () => trans('metatags.collections.of-the-month.title'),
        ]);
    }
}
