<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\CoingeckoPlatform;
use App\Models\Network;
use App\Services\MarketData\Providers\CoingeckoProvider;
use App\Support\Queues;
use Carbon\Carbon;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Arr;

class FetchTokenByCoingeckoId implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $coingeckoId,
        public ?Carbon $retryUntil = null
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(CoingeckoProvider $provider): void
    {
        $data = $provider->token($this->coingeckoId);

        $platforms = $data->platformsDetails();

        $params = collect([
            CoingeckoPlatform::Ethereum,
            CoingeckoPlatform::Polygon,
        ])->map(function ($platform) use ($platforms, $data) {
            $details = Arr::get($platforms, $platform->value);

            if ($details === null) {
                return;
            }

            $network = Network::where('chain_id', $platform->toChain()->value)->first();

            $address = Arr::get($details, 'contract_address');

            $decimals = Arr::get($details, 'decimal_place', 0);

            return [
                'guid' => $this->coingeckoId,
                'name' => $data->name(),
                'symbol' => $data->symbol(),
                'address' => $address,
                'network_id' => $network->id,
                'decimals' => $decimals,
                'extra_attributes' => [
                    'images' => $data->images(),
                    'socials' => [
                        'website' => $data->websiteUrl(),
                        'twitter' => $data->twitterUsername(),
                        'discord' => $data->discordUrl(),
                    ],
                ],
            ];
        })->filter();

        if ($params->isEmpty()) {
            return;
        }

        LiveDumpTokenData::dispatch($params->toArray(), $this->retryUntil)->onQueue(Queues::PRIORITY);
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->coingeckoId;
    }

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return app(CoingeckoProvider::class)->getJobMiddleware();
    }

    public function retryUntil(): DateTime
    {
        return $this->retryUntil ?? Carbon::now()->addMinutes(5);
    }
}
