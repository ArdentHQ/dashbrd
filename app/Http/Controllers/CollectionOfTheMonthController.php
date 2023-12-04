<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CollectionOfTheMonthController extends Controller
{
    public function __invoke(): Response
    {
        $collection = Collection::ofTheMonth()->firstOrFail();

        return Inertia::render('Collections/CollectionOfTheMonth');
    }
}
