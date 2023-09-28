<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\SlackAttachment;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Notification;

final class GalleryNftsChanged extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<int, array{'token_number': string, 'collection_id': int, 'name': string, 'updated_at': string}>  $unassignedNfts
     */
    public function __construct(
        public string $walletAddress,
        public array $unassignedNfts
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
                    ->fields(['nfts' => implode('| ', array_map((fn ($nft) => implode(', ', $nft)), $this->unassignedNfts))]);
            });
    }

    public function shouldSend(): bool
    {
        return config('dashbrd.gallery.logs.enabled');
    }
}
