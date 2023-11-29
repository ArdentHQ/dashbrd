<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CollectionReportController extends Controller
{
    public function store(Request $request, Collection $collection): RedirectResponse
    {
        $request->validate([
            'reason' => ['required', 'string', Rule::in(config('dashbrd.reports.reasons'))],
        ]);

        $collection->reports()->create([
            'user_id' => $request->user()->id,
            'reason' => $request->reason,
        ]);

        return back()->toast(trans('pages.reports.success'), type: 'success', expanded: true);
    }
}
