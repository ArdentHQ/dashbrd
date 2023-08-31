<?php

declare(strict_types=1);

use App\Enums\Service;
use App\Jobs\Middleware\RateLimited;
use App\Jobs\UpdateTokenDetails;
use App\Models\Token;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Redis;

it('runs the job if not throttled for each service', function ($service) {
    $job = new UpdateTokenDetails(Token::factory()->create(), Carbon::now()->addMinute());

    $middleware = new RateLimited($service);

    $closure = function () {
        expect(true)->toBeTrue();
    };

    expect(fn () => $middleware->handle($job, $closure))->not->toThrow(\Exception::class);
})->with([
    'coingecko' => Service::Coingecko,
]);

it('throws an exception if rate limits are missing', function () {
    Config::set('services.coingecko.rate', null);

    $job = new UpdateTokenDetails(Token::factory()->create(), Carbon::now()->addMinute());

    $middleware = new RateLimited(Service::Coingecko);

    $middleware->handle($job, function () {
    });
})->throws(\Exception::class);

it('releases the job if throttled', function ($service) {
    $job = new UpdateTokenDetails(Token::factory()->create(), Carbon::now()->addMinute());

    // We can't pass the `$service` value into the class to perform the assertion so we temporarily store
    // the service rate per seconds in a temporary config value. Currently it doesn't matter much since both
    // Coingecko and Moralis use the same value (60 seconds), but it should future-proof it in case one of them
    // is changed and causes a problem.
    Config::set('services.test-service.rate.per_seconds', config('services.'.$service->value.'.rate.per_seconds'));

    $jobJob = new class extends \Illuminate\Queue\Jobs\Job implements \Illuminate\Contracts\Queue\Job
    {
        public function getJobId()
        {
            return 'test';
        }

        public function getRawBody()
        {
            return 'test';
        }

        public function release($delay = 0)
        {
            expect($delay)->toBe(config('services.test-service.rate.per_seconds') + 5);
        }

        public function attempts()
        {
            return 1;
        }
    };

    $job->setJob($jobJob);

    Redis::shouldReceive('throttle')
        ->with('api-service.'.$service->value)
        ->andReturnSelf()
        ->shouldReceive('block')
        ->andReturnSelf()
        ->shouldReceive('allow')
        ->andReturnSelf()
        ->shouldReceive('every')
        ->andReturnSelf()
        ->shouldReceive('then')
        // Mock implementation
        ->andReturnUsing(function (callable $callback, callable $failure = null) use ($job) {
            $failure($job);
        });

    $middleware = new RateLimited($service);

    $closure = function () {
        // Should not run
        expect(false)->toBeTrue();
    };

    $middleware->handle($job, $closure);
})->with([
    'coingecko' => Service::Coingecko,
]);
