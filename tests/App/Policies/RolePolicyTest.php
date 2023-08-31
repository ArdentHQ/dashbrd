<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Policies\RolePolicy;

beforeEach(function () {
    setUpPermissions();

    $this->instance = new RolePolicy();
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();

    $this->admin->assignRole([RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail()]);
});

it('should not be able to view roles', function () {
    expect($this->instance->viewAny($this->user))->toBeFalse();
});

it('should not be able to view a single role', function () {
    $role = RoleModel::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->view($this->user, $role))->toBeFalse();
});

it('should not be able to create roles', function () {
    expect($this->instance->create($this->user))->toBeFalse();
});

it('should not be able to update a single role', function () {
    $role = RoleModel::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->update($this->user, $role))->toBeFalse();
});

it('should not be able to delete a single role', function () {
    $role = RoleModel::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->delete($this->user, $role))->toBeFalse();
});

it('should be able to view roles', function () {
    expect($this->instance->viewAny($this->admin))->toBeTrue();
});

it('should be able to view a single role', function () {
    $role = RoleModel::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->view($this->admin, $role))->toBeTrue();
});

it('should be able to create roles', function () {
    expect($this->instance->create($this->admin))->toBeTrue();
});

it('should be able to update a single role', function () {
    $role = RoleModel::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->update($this->admin, $role))->toBeTrue();
});

it('should be able to delete a single unused role', function () {
    $role = RoleModel::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->delete($this->admin, $role))->toBeTrue();
});
