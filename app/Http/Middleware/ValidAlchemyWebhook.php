<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class ValidAlchemyWebhook
{
    /**
     * Validate that the request is a verified Alchemy webhook request.
     *
     * @see https://docs.alchemy.com/reference/notify-api-quickstart#webhook-signature--security
     *
     * @param  \Closure(Request):Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = config('services.alchemy.webhook_signature');

        $hash = hash_hmac('sha256', $request->getContent(), $token);

        if (! hash_equals($request->header('x-alchemy-signature'), $hash)) {
            throw new RuntimeException('Not a valid Alchemy request.');
        }

        return $next($request);
    }
}
