<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\Queues;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Notification;

class Report extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    public static function booted(): void
    {
        static::created(function (self $report) {
            Notification::route('slack', config('dashbrd.reports.slack_webhook_url'))->notify(
                $report->subject->newReportNotification($report)->onQueue(Queues::DEFAULT)
            );
        });
    }

    /**
     * @return BelongsTo<User, Report>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return MorphTo<Model, Report>
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return array<string, string>
     */
    public static function reasons(): array
    {
        /** @var string[] */
        $reasons = config('dashbrd.reports.reasons');

        return collect($reasons)->mapWithKeys(fn (string $reason) => [
            $reason => trans('pages.reports.reasons.'.$reason),
        ])->all();
    }
}
