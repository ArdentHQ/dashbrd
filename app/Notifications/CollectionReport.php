<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Collection;
use App\Models\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\SlackAttachment;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Notification;

final class CollectionReport extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Report $report
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
            ->content('A collection [ID: #'.$this->report->subject->id.'] has been reported.')
            ->attachment(function (SlackAttachment $attachment) {
                /** @var Collection */
                $collection = $this->report->subject;

                $attachment
                    ->title(title: $collection->name, url: route('collections.view', $collection))
                    ->author('Reporter: '.$this->reporter())
                    ->fields($this->fields());
            });
    }

    public function shouldSend(): bool
    {
        return config('dashbrd.reports.enabled');
    }

    private function reporter(): string
    {
        $wallet = $this->report->user?->wallet;

        if ($wallet === null) {
            return 'Unknown address';
        }

        return $wallet?->details?->domain ?? $wallet->address;
    }

    private function reason(): string
    {
        return trans('pages.reports.reasons.'.$this->report->reason);
    }

    /**
     * @return array<string, string>
     */
    private function fields(): array
    {
        return array_filter([
            'Reason' => $this->reason(),
            'Environment' => app()->environment('production') ? null : app()->environment(),
        ]);
    }
}
