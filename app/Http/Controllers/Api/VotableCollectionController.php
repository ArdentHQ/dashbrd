<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Collections\VotableCollectionData;
use App\Http\Controllers\Controller;
use App\Http\Requests\FilterableCollectionRequest;
use App\Models\Collection;
use App\Models\CollectionWinner;
use App\Models\User;
use App\Repositories\CollectionRepository;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\JsonResponse;

class VotableCollectionController extends Controller
{
    /**
     * Get all of the votable collections and the collection that the user has voted on.
     */
    public function index(FilterableCollectionRequest $request, CollectionRepository $collections): JsonResponse
    {
        $user = $request->user();

        $userVoted = $user !== null
                            ? Collection::votedByUserInCurrentMonth($user)->exists()
                            : false;

        $collections = $collections->votable($user);

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
        $collection = Collection::query()
                                ->withCount(['nfts', 'votes' => fn ($q) => $q->inCurrentMonth()])
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
