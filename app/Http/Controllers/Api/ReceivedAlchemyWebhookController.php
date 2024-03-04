<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessAlchemyWebhook;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReceivedAlchemyWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        if ($request->input('type') !== 'NFT_ACTIVITY') {
            return response('');
        }

        if ($request->has('event.activity')) {
            ProcessAlchemyWebhook::dispatch($request->collect('event.activity'));
        } else {
            ProcessAlchemyWebhook::dispatch(collect([$request->input('event')]));
        }

        return response('');
    }
}
