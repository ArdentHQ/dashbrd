<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\TokenType;
use App\Jobs\FetchCollectionActivity;
use App\Jobs\RefreshNftMetadata;
use App\Models\Collection;
use App\Models\Nft;
use App\Models\SpamContract;
use App\Support\Queues;
use Symfony\Component\HttpFoundation\JsonResponse;

class RefreshedNftController extends Controller
{
    public function __invoke(Collection $collection, Nft $nft): JsonResponse
    {
        abort_if($collection->type !== TokenType::Erc721, 404);

        // The job itself is rate-limited on NFT id to run only once per hour regardless of how many different users try
        // to refresh its metadata. A user is not really supposed to know about this internal "cooldown",
        // hence if the user didn't run into a per-user rate limit we consider it still a success.
        // It's supposed to be completely opaque to the user what the "refresh" is doing.

        if (SpamContract::isSpam($collection->address, $collection->network)) {
            return new JsonResponse([]);
        }

        $nft->touch('metadata_requested_at');
        RefreshNftMetadata::dispatch()->onQueue(Queues::NFTS);

        if ($collection->indexesActivities()) {
            FetchCollectionActivity::dispatch($collection)->onQueue(Queues::NFTS);
        }

        return response()->json([
            'success' => true,
        ]);
    }
}
