<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\AlchemyWebhookType;
use App\Jobs\Traits\RecoversFromProviderErrors;
use App\Models\AlchemyWebhook;
use App\Models\Collection;
use App\Models\Network;
use App\Support\Facades\Alchemy;
use DateTime;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection as LaravelCollection;
use Illuminate\Support\Str;

class PublishAlchemyWebhookForCollectionActivity implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, RecoversFromProviderErrors, SerializesModels;

    public function __construct(
        public Network $network
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $addresses = $this->addresses();
        $webhook = $this->findWebhook();

        $checksum = hash('sha256', $addresses->join(','));

        // There have been no webhook changes that need to be published on Alchemy, so avoid making unnecessary request...
        if ($webhook?->checksum === $checksum) {
            return;
        }

        // There is no "activity" webhook created in Alchemy, so we want to create one...
        if ($webhook === null) {
            $url = config('app.url').'/api/alchemy-webhooks';

            $webhookId = Alchemy::createActivityWebhook($this->network, $url, $addresses);

            AlchemyWebhook::create([
                'provider_id' => $webhookId,
                'url' => $url,
                'type' => AlchemyWebhookType::Activity,
                'checksum' => $checksum,
                'addresses' => $addresses->toArray(),
            ]);

            return;
        }

        Alchemy::updateActivityWebhook(
            webhookId: $webhook->provider_id,
            addressesToAdd: $addresses->diff($webhook->addresses),
            addressesToRemove: collect($webhook->addresses)->diff($addresses)
        );

        $webhook->update([
            'checksum' => $checksum,
            'addresses' => $addresses->toArray(),
        ]);
    }

    /**
     * Retrieve the existing activity webhook instance.
     */
    private function findWebhook(): ?AlchemyWebhook
    {
        return AlchemyWebhook::query()
                        ->where('network_id', $this->network->id)
                        ->where('type', AlchemyWebhookType::Activity)
                        ->first();
    }

    /**
     * Get the contract address of every single collection model in the database that'll be used to generate a checksum.
     *
     * @return LaravelCollection<int, string>
     */
    private function addresses(): LaravelCollection
    {
        return Collection::query()
                        ->orderBy('address', 'asc')
                        ->pluck('address')
                        ->withoutSpamContracts()
                        ->filter->indexesActivities(withSpamCheck: false)
                        ->map(fn ($address) => Str::lower($address));
    }

    /**
     * Create a unique ID for the job.
     */
    public function uniqueId(): string
    {
        return static::class;
    }

    /**
     * Determine the time at which the job should timeout.
     */
    public function retryUntil(): DateTime
    {
        return now()->addMinutes(10);
    }
}
