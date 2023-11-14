<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Report;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Policies\ReportPolicy;

beforeEach(function () {
    $this->instance = new ReportPolicy();
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();
    $this->editor = User::factory()->editor()->create();

    $this->admin->assignRole([
        RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail(),
    ])->save();
});

it('should be able to view reports', function () {
    expect($this->user->hasPermissionTo('report:viewAny', 'admin'))->toBeFalse();
    expect($this->editor->hasPermissionTo('report:viewAny', 'admin'))->toBeFalse();
    expect($this->admin->hasPermissionTo('report:viewAny', 'admin'))->toBeTrue();
    expect($this->instance->viewAny($this->user))->toBeFalse();
    expect($this->instance->viewAny($this->editor))->toBeFalse();
    expect($this->instance->viewAny($this->admin))->toBeTrue();
});

it('should be able to view a single report', function () {
    $report = Report::factory()->create();

    expect($this->user->hasPermissionTo('report:view', 'admin', $report))->toBeFalse();
    expect($this->editor->hasPermissionTo('report:view', 'admin', $report))->toBeFalse();
    expect($this->admin->hasPermissionTo('report:view', 'admin', $report))->toBeTrue();
    expect($this->instance->view($this->user, $report))->toBeFalse();
    expect($this->instance->view($this->editor, $report))->toBeFalse();
    expect($this->instance->view($this->admin, $report))->toBeTrue();
});

it('should be able to update report', function () {
    $report = Report::factory()->create();

    expect($this->user->hasPermissionTo('report:update', 'admin', $report))->toBeFalse();
    expect($this->editor->hasPermissionTo('report:update', 'admin', $report))->toBeFalse();
    expect($this->admin->hasPermissionTo('report:update', 'admin', $report))->toBeTrue();
    expect($this->instance->update($this->user, $report))->toBeFalse();
    expect($this->instance->update($this->editor, $report))->toBeFalse();
    expect($this->instance->update($this->admin, $report))->toBeTrue();
});
