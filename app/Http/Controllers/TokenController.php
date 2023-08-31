<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Data\TokenListItemData;
use App\Data\TokenPortfolioData;
use App\Models\Network;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\PaginatedDataCollection;

class TokenController extends Controller
{
    /**
     * @return PaginatedDataCollection<int, TokenListItemData>
     */
    public function list(Request $request): PaginatedDataCollection
    {
        /** @var User $user */
        $user = $request->user();

        return TokenListItemData::paginated(
            user: $user,
            perPage: $request->integer('page_size', 10),
            currentPage: $request->integer('page', 1),
            sortBy: $request->get('sort', 'fiat_balance'),
            sortDirection: $request->get('direction', 'desc'),
            chainIds: Network::activeChainIds()
        );
    }

    /**
     * @return DataCollection<int, TokenPortfolioData>
     */
    public function breakdown(Request $request): DataCollection
    {
        /** @var User $user */
        $user = $request->user();

        return TokenPortfolioData::breakdown(
            user: $user,
            topCount: $request->integer('top_count', 6),
            networkIds: Network::onlyActive()->pluck('id')->toArray()
        );
    }

    /**
     * @return DataCollection<int, TokenListItemData>
     */
    public function searchTokens(Request $request): DataCollection
    {
        /** @var User $user */
        $user = $request->user();

        $query = $request->has('query') ? $request->get('query') : '';

        $items = DB::select(get_query('tokens.search_tokens', [
            'walletId' => $user->wallet_id,
            'currency' => $user->currency()->canonical(),
            'query' => ':query',
            'limit' => 5,
            'chainIds' => implode(',', Network::activeChainIds()),
        ]), ['query' => sprintf('%s%%', $query)]);

        return TokenListItemData::collection($items);
    }
}
