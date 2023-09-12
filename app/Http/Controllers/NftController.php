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
use App\Models\Collection;
use App\Models\Nft;
use App\Support\RateLimiterHelpers;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NftController extends Controller
{
    public function show(Request $request, Collection $collection, Nft $nft): Response
    {
        $nativeToken = $collection->network->tokens()->nativeToken()->defaultToken()->first();

        // Dispatch every 3 days...
        if (! $nft->last_activity_fetched_at || ! $nft->last_viewed_at || now() > $nft->last_viewed_at->addDays(3)) {
            FetchNftActivity::dispatch($nft);
        }

        $nft->touch('last_viewed_at');

        return Inertia::render('Collections/Nfts/View', [
            'nft' => NftData::fromModel($nft),
            'activities' => $this->getActivities($request, $nft),
            'collectionDetails' => CollectionBasicDetailsData::fromModel($collection),
            'alreadyReported' => $nft->wasReportedByUserRecently($request->user()),
            'reportAvailableIn' => RateLimiterHelpers::nftReportAvailableInHumanReadable($request, $nft),
            'traits' => CollectionTraitData::collection($nft->traits),
            'nativeToken' => TokenData::fromModel($nativeToken),
        ]);
    }

    private function getActivities(Request $request, Nft $nft): NftActivitiesData
    {
        // Limit the pagination to 100 items...
        $pageLimit = min($request->integer('pageLimit', 10), 100);

        $activities = $nft->activities()
                        ->latest('timestamp')
                        ->paginate($pageLimit)
                        ->through(fn ($activity) => $activity->setRelation('nft', $nft))
                        ->appends([
                            'pageLimit' => $pageLimit,
                            'tab' => 'activity',
                        ]);

        return new NftActivitiesData(
            paginated: NftActivityData::collection($activities)
        );
    }
}
