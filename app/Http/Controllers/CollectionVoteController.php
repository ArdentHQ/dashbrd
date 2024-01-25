<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\CollectionWinner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CollectionVoteController extends Controller
{
    public function store(Request $request, Collection $collection): RedirectResponse
    {
        if (CollectionWinner::where('collection_id', $collection->id)->where('rank', 1)->exists()) {
            return back()->toast(trans('pages.collections.collection_of_the_month.already_won'), type: 'error');
        }

        if ($request->wallet()->votes()->inCurrentMonth()->exists()) {
            return back()->toast(trans('pages.collections.collection_of_the_month.vote_failed'), type: 'error');
        }

        $collection->addVote($request->wallet());

        return back()->toast(trans('pages.collections.collection_of_the_month.vote_success'), type: 'success');
    }
}
