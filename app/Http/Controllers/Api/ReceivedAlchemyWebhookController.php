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
        ProcessAlchemyWebhook::dispatch($request->all());

        return response('');
    }
}
