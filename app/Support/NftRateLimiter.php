<?php

declare(strict_types=1);

namespace App\Support;

use App\Enums\ToastType;
use App\Models\Nft;
use Illuminate\Cache\RateLimiting\Limit;

class NftRateLimiter
{
    public function __construct(
        private Nft $nft,
        private ?int $userId,
        private ?string $ip = null
    ) {
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
            Limit::perDay(config('dashbrd.reports.throttle.nft.per_day', 1))
                ->by('nft:'.$this->nft->id.':'.($this->userId ?: $this->ip))
                ->response($responseCallback),

            Limit::perHour(config('dashbrd.reports.throttle.nft.per_hour', 6))
                ->by(($this->userId ?: $this->ip))
                ->response($responseCallback),
        ];
    }
}
