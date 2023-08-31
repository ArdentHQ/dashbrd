<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Nft;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class NftReportController extends Controller
{
    public function store(Nft $nft): RedirectResponse
    {
        request()->validate([
            'reason' => ['required', 'string', Rule::in(config('dashbrd.reports.reasons'))],
        ]);

        $nft->reports()->create([
            'user_id' => request()->user()->id,
            'reason' => request()->get('reason'),
        ]);

        return back()->toast(trans('pages.reports.success'), type: 'success', expanded: true);
    }
}
