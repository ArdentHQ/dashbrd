<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Gallery;
use App\Models\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\SlackAttachment;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Notification;

final class GalleryReport extends Notification implements ShouldQueue
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
            ->content('A gallery [ID: #'.$this->report->subject->id.'] has been reported.')
            ->attachment(function (SlackAttachment $attachment) {
                /** @var Gallery */
                $gallery = $this->report->subject;

                $attachment
                    ->title(title: $gallery->name, url: route('galleries.view', $gallery))
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
        $wallet = $this->report->subject->user->wallet;

        return array_filter([
            'Reason' => $this->reason(),
            'Author' => $wallet?->details?->domain ?? ($wallet?->address ?? 'Unknown'),
            'Environment' => app()->environment('production') ? null : app()->environment(),
        ]);
    }
}
