<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('report:viewAny', 'admin');
    }

    public function view(User $user, Report $report): bool
    {
        return $user->hasPermissionTo('report:view', 'admin');
    }

    public function update(User $user, Report $report): bool
    {
        return $user->hasPermissionTo('report:update', 'admin');
    }
}
