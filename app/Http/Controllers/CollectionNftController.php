<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\Collections\CollectionBasicDetailsData;
use App\Data\Collections\CollectionTraitData;
use App\Data\Nfts\NftActivitiesData;
use App\Data\Nfts\NftActivityData;
use App\Data\Nfts\NftData;
use App\Data\Token\TokenData;
use App\Jobs\FetchNftActivity;
use App\Jobs\RefreshNftMetadata;
use App\Models\Collection;
use App\Models\Nft;
use App\Models\User;
use App\Support\Queues;
use App\Support\RateLimiterHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\LaravelData\DataCollection;
use Symfony\Component\HttpFoundation\JsonResponse;

class CollectionNftController extends Controller
{
    public function view(Request $request, Collection $collection, Nft $nft): Response
    {
        /** @var User $user */
        $user = request()->user();

        $nativeToken = $collection->network->tokens()->nativeToken()->defaultToken()->first();

        // Dispath on initial visit, and again after 3 days.
        if (! $nft->last_activity_fetched_at || ! $nft->last_viewed_at || now() > $nft->last_viewed_at->addDays(3)) {
            FetchNftActivity::dispatch($nft);
        }

        $nft->touch('last_viewed_at');

        return Inertia::render('Collections/Nfts/View', [
            'nft' => NftData::fromModel($nft),
            'activities' => $this->getActivities($request, $nft),
            'collectionDetails' => CollectionBasicDetailsData::fromModel($collection),
            'previousUrl' => $this->getPreviousUrl(),
            'alreadyReported' => $nft->wasReportedByUserRecently($user),
            'reportAvailableIn' => RateLimiterHelpers::nftReportAvailableInHumanReadable(request(), $nft),
            'traits' => $this->getNftTraits($nft),
            'nativeToken' => TokenData::fromModel($nativeToken),
        ]);
    }

    public function refresh(Request $request, Collection $collection, Nft $nft): JsonResponse
    {
        // The job itself is rate-limited on NFT id to run only once per hour regardless of how many different users try
        // to refresh its metadata. A user is not really supposed to know about this internal "cooldown",
        // hence if the user didn't run into a per-user rate limit we consider it still a success.
        // It's supposed to be completely opaque to the user what the "refresh" is doing.
        RefreshNftMetadata::dispatch($collection, $nft)->onQueue(Queues::NFTS);

        FetchNftActivity::dispatch($nft);

        return response()->json(['success' => true]);
    }

    /**
     * @return DataCollection<int, CollectionTraitData>
     */
    private function getNftTraits(Nft $nft): DataCollection
    {
        return CollectionTraitData::collection($nft->traits()->get());
    }

    private function getActivities(Request $request, Nft $nft): NftActivitiesData
    {
        // Allows any number but not more than 100
        $pageLimit = min($request->has('pageLimit') ? (int) $request->get('pageLimit') : 10, 100);

        $activities = $nft->activities()
            ->with('nft')
            ->latest('timestamp')->paginate($pageLimit)->appends([
                'pageLimit' => $pageLimit,
                'tab' => 'activity',
            ]);

        return new NftActivitiesData(NftActivityData::collection($activities));
    }

    private function getPreviousUrl(): ?string
    {
        return url()->previous() === url()->current()
            ? null
            : url()->previous();
    }
}
