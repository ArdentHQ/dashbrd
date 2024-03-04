<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\PublishAlchemyWebhookForCollectionActivity;
use App\Models\Network;
use Illuminate\Console\Command;

class PublishAlchemyWebhooksForAllNetworks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webhooks:publish-alchemy';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish all Alchemy webhooks for every network';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        Network::onlyActive()->get()->each(function ($network) {
            PublishAlchemyWebhookForCollectionActivity::dispatch($network);

            $this->info('Publishing an Alchemy webhook for network: '.$network->name);
        });

        return Command::SUCCESS;
    }
}
