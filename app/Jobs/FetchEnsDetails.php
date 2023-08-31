<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Jobs\Traits\WithWeb3DataProvider;
use App\Models\Wallet;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\Response;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FetchEnsDetails implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, WithWeb3DataProvider, RecoversFromProviderErrors;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Wallet $wallet,
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $provider = $this->getWeb3DataProvider();

        $ensDomain = $provider->getEnsDomain($this->wallet);

        $walletDetails = $this->wallet->details()->updateOrCreate([
            'domain' => $ensDomain,
        ]);

        $imageBody = $this->fetchEnsAvatar($ensDomain);

        if ($imageBody !== null) {
            $checksum = md5($imageBody);

            if (! $this->imageChanged($checksum)) {
                return;
            }

            $walletDetails
                ->addMediaFromString($imageBody)
                ->usingFileName(Str::random(32))
                ->withCustomProperties([
                    'checksum' => $checksum,
                ])
                ->toMediaCollection('avatar');
        } else {
            $walletDetails->getFirstMedia('avatar')?->delete();
        }
    }

    private function fetchEnsAvatar(?string $ensDomain): ?string
    {
        if ($ensDomain === null) {
            return null;
        }

        $response = Http::get("https://metadata.ens.domains/mainnet/avatar/{$ensDomain}");

        if ($this->isImage($response)) {
            return $response->body();
        }

        return null;
    }

    private function imageChanged(string $checksum): bool
    {
        $media = $this->wallet->details?->getFirstMedia('avatar');

        if ($media === null) {
            return true;
        }

        return $media->getCustomProperty('checksum') !== $checksum;
    }

    private function isImage(Response $response): bool
    {
        return Str::startsWith($response->header('Content-Type'), 'image/');
    }

    public function uniqueId(): string
    {
        return self::class.':'.$this->wallet->id;
    }

    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
