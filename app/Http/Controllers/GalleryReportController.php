<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Gallery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GalleryReportController extends Controller
{
    public function store(Request $request, Gallery $gallery): RedirectResponse
    {
        abort_if($request->user()->is($gallery->user), 403);

        $request->validate([
            'reason' => ['required', 'string', Rule::in(config('dashbrd.reports.reasons'))],
        ]);

        $gallery->reports()->create([
            'user_id' => $request->user()->id,
            'reason' => $request->reason,
        ]);

        return back()->toast(trans('pages.reports.success'), type: 'success', expanded: true);
    }
}
