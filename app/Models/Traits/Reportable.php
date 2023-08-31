<?php

declare(strict_types=1);

namespace App\Models\Traits;

use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Reportable
{
    /**
     * @return MorphMany<Report>
     */
    public function reports(): MorphMany
    {
        return $this->morphMany(Report::class, 'subject');
    }

    public function wasReportedByUserRecently(User $user): bool
    {
        $hoursAgo = $this->reportingThrottleDuration();

        return $this->reports()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', Carbon::now()->subHours($hoursAgo))
            ->exists();
    }

    abstract protected function reportingThrottleDuration(): int;
}
