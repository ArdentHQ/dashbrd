<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Support\Cache\UserCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HiddenCollectionController extends Controller
{
    public function store(Request $request, Collection $collection): RedirectResponse
    {
        abort_unless($request->user()->collections()->where('id', $collection->id)->exists(), 404);

        if (! $request->user()->hiddenCollections->contains($collection)) {
            $request->user()->hiddenCollections()->attach($collection);

            UserCache::clearAll($request->user());

            // Clear the cache that contains the total collection value, as that value is in currency...
            Cache::forget("users:{$request->user()->id}:total-collection-value");
            Cache::forget("users:{$request->user()->id}:total-hidden-collection-value");
        }

        return back();
    }

    public function destroy(Request $request, Collection $collection): RedirectResponse
    {
        abort_unless($request->user()->collections()->where('id', $collection->id)->exists(), 404);

        if ($request->user()->hiddenCollections->contains($collection)) {
            $request->user()->hiddenCollections()->detach($collection);

            UserCache::clearAll($request->user());

            // Clear the cache that contains the total collection value, as that value is in currency...
            Cache::forget("users:{$request->user()->id}:total-collection-value");
            Cache::forget("users:{$request->user()->id}:total-hidden-collection-value");
        }

        return back();
    }
}
