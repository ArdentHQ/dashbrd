<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Nft;
use App\Models\Wallet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\SlackAttachment;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Notification;

final class GalleryNftsChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $walletAddress,
        public array $deletedNfts
    ) {
    }

    /**
     * @return string[]
     */
    public function via(AnonymousNotifiable $notifiable): array
    {
        return ['slack'];
    }

    public function toSlack(AnonymousNotifiable $notifiable): SlackMessage
    {
        return (new SlackMessage)
            ->error()
            ->content('One or more galleries owned by ['.$this->walletAddress.'] have been changed')
            ->attachment(function (SlackAttachment $attachment) {
                $attachment
                    ->title('Affected NFTs')
                    ->fields(['nfts' => implode(', ', $this->deletedNfts)]);
            });
    }

    public function shouldSend(): bool
    {
        return config('dashbrd.reports.enabled');
    }
}
