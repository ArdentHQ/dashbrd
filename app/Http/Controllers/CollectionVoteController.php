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
        $collection->addVote($request->wallet());

        return back()->toast(trans('pages.collections.collection_of_the_month.vote_success'), type: 'success');
    }
}
