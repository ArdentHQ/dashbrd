<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Jobs\FetchCollectionActivity;
use App\Jobs\RefreshNftMetadata;
use App\Models\Collection;
use App\Models\Nft;
use App\Support\Queues;
use Symfony\Component\HttpFoundation\JsonResponse;

class RefreshedNftController extends Controller
{
    public function __invoke(Collection $collection, Nft $nft): JsonResponse
    {
        // The job itself is rate-limited on NFT id to run only once per hour regardless of how many different users try
        // to refresh its metadata. A user is not really supposed to know about this internal "cooldown",
        // hence if the user didn't run into a per-user rate limit we consider it still a success.
        // It's supposed to be completely opaque to the user what the "refresh" is doing.
        RefreshNftMetadata::dispatch($collection, $nft)->onQueue(Queues::NFTS);

        FetchCollectionActivity::dispatch($collection)->onQueue(Queues::NFTS);

        return response()->json([
            'success' => true,
        ]);
    }
}
