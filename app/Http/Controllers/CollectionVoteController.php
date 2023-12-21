<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CollectionVoteController extends Controller
{
    public function store(Request $request, Collection $collection): RedirectResponse
    {
        if ($request->wallet()->votes()->where('voted_at', '>=', now()->subMonth())->exists()) {
            return back()->toast(trans('pages.collections.collection_of_the_month.vote_failed'), type: 'error');
        }

        $collection->addVote($request->wallet());

        return back()->toast(trans('pages.collections.collection_of_the_month.vote_success'), type: 'success');
    }
}
