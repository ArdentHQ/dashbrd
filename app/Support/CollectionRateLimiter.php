<?php

declare(strict_types=1);

namespace App\Support;

use App\Enums\ToastType;
use App\Models\Collection;
use Illuminate\Cache\RateLimiting\Limit;

class CollectionRateLimiter
{
    public function __construct(private Collection $collection, private ?int $userId, private ?string $ip = null)
    {
        //
    }

    /**
     * @return Limit[]
     */
    public function __invoke(): array
    {
        $responseCallback = static function ($request, $headers) {
            $retryAfterSeconds = $headers['Retry-After'];

            $availableIn = RateLimiterHelpers::availableInHumanReadable($retryAfterSeconds);

            $message = trans('pages.reports.throttle', [
                'time' => $availableIn,
            ]);

            return back()->toast($message, ToastType::Warning->value);
        };

        return [
            Limit::perDay(config('dashbrd.reports.throttle.collection.per_day', 1))
                ->by(sha1('collection:'.$this->collection->id.':'.($this->userId ?: $this->ip)))
                ->response($responseCallback),

            Limit::perHour(config('dashbrd.reports.throttle.collection.per_hour', 6))
                ->by(sha1($this->userId ? (string) $this->userId : $this->ip))
                ->response($responseCallback),
        ];
    }
}
