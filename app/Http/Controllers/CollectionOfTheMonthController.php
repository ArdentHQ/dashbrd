<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class CollectionOfTheMonthController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Collections/CollectionOfTheMonth', [
            'allowsGuests' => true,
            'title' => fn () => trans('metatags.collections.of-the-month.title'),
        ]);
    }
}
