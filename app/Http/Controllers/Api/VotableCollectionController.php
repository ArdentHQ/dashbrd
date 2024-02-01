<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Collections\VotableCollectionData;
use App\Enums\Period;
use App\Http\Controllers\Controller;
use App\Http\Requests\FilterableCollectionRequest;
use App\Models\Collection;
use App\Models\CollectionWinner;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\JsonResponse;

class VotableCollectionController extends Controller
{
    /**
     * Get all of the votable collections and the collection that the user has voted on.
     */
    public function index(FilterableCollectionRequest $request): JsonResponse
    {
        $user = $request->user();

        $userVoted = $user !== null
                            ? Collection::votedByUserInCurrentMonth($user)->exists()
                            : false;

        $collections = Collection::votable()
                                ->withCount(['votes' => fn ($q) => $q->inCurrentMonth()])
                                ->orderBy('votes_count', 'desc')
                                ->orderByVolume(Period::MONTH, $request->currency())
                                ->with('network.nativeToken')
                                ->when($user === null, fn ($q) => $q->limit(13))
                                ->when($user !== null, fn ($q) => $q->limit(700))
                                ->get();

        $winners = CollectionWinner::ineligibleCollectionIds();

        return response()->json([
            'votedCollection' => $user === null ? null : $this->getVotedCollection($user, $collections),
            'collections' => $collections->take(13)->map(fn ($collection) => VotableCollectionData::fromModel(
                $collection,
                currency: $request->currency(),
                showVotes: $userVoted,
                alreadyWon: $winners->contains($collection->id),
            )),
        ]);
    }

    /**
     * Get the collection that the user has voted on in the current month.
     *
     * @param  EloquentCollection<int, Collection>  $collections
     */
    private function getVotedCollection(User $user, EloquentCollection $collections): ?VotableCollectionData
    {
        $collection = Collection::votable()
                                ->withCount(['votes' => fn ($q) => $q->inCurrentMonth()])
                                ->with('network.nativeToken')
                                ->votedByUserInCurrentMonth($user)
                                ->first();

        if ($collection === null) {
            return null;
        }

        /** @var int|false */
        $index = $collections->search(fn ($c) => $c->id === $collection->id);

        return VotableCollectionData::fromModel(
            $collection,
            $user->currency(),
            showVotes: true,
            rank: $index === false ? null : ($index + 1),
        );
    }
}
