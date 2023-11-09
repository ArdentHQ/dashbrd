<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;
use Illuminate\Auth\Access\Response;

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
