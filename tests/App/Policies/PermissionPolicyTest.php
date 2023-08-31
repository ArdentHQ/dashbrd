<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Permission;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Policies\PermissionPolicy;

beforeEach(function () {
    setUpPermissions();

    $this->instance = new PermissionPolicy();
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();

    $this->admin->assignRole([RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail()]);
});

it('should not be able to view permissions', function () {
    expect($this->instance->viewAny($this->user))->toBeFalse();
});

it('should not be able to view a single permission', function () {
    $permission = Permission::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->view($this->user, $permission))->toBeFalse();
});

it('should not be able to create permissions', function () {
    expect($this->instance->create($this->user))->toBeFalse();
});

it('should not be able to update a single permission', function () {
    $permission = Permission::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->update($this->user, $permission))->toBeFalse();
});

it('should not be able to delete a single permission', function () {
    $permission = Permission::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->delete($this->user, $permission))->toBeFalse();
});

it('should be able to view permissions', function () {
    expect($this->instance->viewAny($this->admin))->toBeTrue();
});

it('should be able to view a single permission', function () {
    $permission = Permission::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->view($this->admin, $permission))->toBeTrue();
});

it('should be able to create permissions', function () {
    expect($this->instance->create($this->admin))->toBeTrue();
});

it('should be able to update a single permission', function () {
    $permission = Permission::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->update($this->admin, $permission))->toBeTrue();
});

it('should be able to delete a single permission', function () {
    $permission = Permission::create([
        'name' => 'test:view',
        'guard_name' => 'admin',
    ]);

    expect($this->instance->delete($this->admin, $permission))->toBeTrue();
});
