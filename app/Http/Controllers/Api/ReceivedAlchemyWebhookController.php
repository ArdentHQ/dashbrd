<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Enums\Chain;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessAlchemyWebhook;
use App\Models\Network;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReceivedAlchemyWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        if ($request->input('type') !== 'NFT_ACTIVITY') {
            return response('');
        }

        $network = Network::firstWhere('chain_id', match ($request->input('network')) {
            'ETH_MAINNET' => Chain::ETH->value,
            'ETH_GOERLI' => Chain::Goerli->value,
            'MATIC_MAINNET' => Chain::Polygon->value,
            'MATIC_MUMBAI' => Chain::Mumbai->value,
        });

        if (! $network) {
            return response('');
        }

        $activity = $request->has('event.activity') ? $request->collect('event.activity') : collect([
            $request->input('event'),
        ]);

        ProcessAlchemyWebhook::dispatch($activity, $network);

        return response('');
    }
}
