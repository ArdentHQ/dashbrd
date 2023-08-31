<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(static function (Throwable $e) {
            if (app()->bound('sentry') && app()->environment('production', 'staging', 'local')) {
                app('sentry')->captureException($e);
            }
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $e)
    {
        $response = parent::render($request, $e);

        if (! $request->wantsJson() &&
            $response instanceof Response &&
            in_array($response->status(), [401, 403, 404, 419, 429, 500, 503])
        ) {
            return Inertia::render('Error', [
                ...(new HandleInertiaRequests())->share($request),
                'error' => true,
                'statusCode' => $response->status(),
                // Flash session data creates a exception because the session
                // store is not available. Not needed on the error pages
                'toast' => null,
                'contactEmail' => config('dashbrd.contact_email'),
            ])
            ->toResponse($request)
            ->setStatusCode($response->status());
        }

        return $response;
    }
}
