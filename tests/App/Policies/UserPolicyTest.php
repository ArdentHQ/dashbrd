<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Policies\UserPolicy;
use App\Support\PermissionRepository;

beforeEach(function () {
    setUpPermissions();

    $this->instance = new UserPolicy();
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();

    $this->admin->assignRole([
        RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail(),
    ])->save();
});

it('should not be able to view users', function () {
    expect($this->instance->viewAny($this->user))->toBeFalse();
    expect($this->user->hasPermissionTo('user:viewAny', 'admin'))->toBeFalse();
});

it('should be able to view users', function () {
    expect($this->instance->viewAny($this->admin))->toBeTrue();
    expect($this->admin->hasPermissionTo('user:viewAny', 'admin'))->toBeTrue();
});

it('should not be able to view a single user', function () {
    $user = User::factory()->create();

    expect($this->user->hasPermissionTo('user:view', 'admin'))->toBeFalse();
    expect($this->instance->view($this->user, $user))->toBeFalse();
});

it('should be able to view a single user if same as target', function () {
    expect($this->user->hasPermissionTo('user:view', 'admin'))->toBeFalse();
    expect($this->instance->view($this->user, $this->user))->toBeTrue();
});

it('should be able to view a single user', function () {
    $user = User::factory()->create();

    expect($this->admin->hasPermissionTo('user:view', 'admin'))->toBeTrue();
    expect($this->instance->view($this->admin, $user))->toBeTrue();
});

it('should be able to update own user', function () {
    expect($this->instance->update($this->user, $this->user))->toBeTrue();
});

it('should not be able to create users', function () {
    expect($this->instance->create($this->user))->toBeFalse();
});

it('should be able to create users', function () {
    expect($this->instance->create($this->admin))->toBeTrue();
});

it('should not be able to update a single user', function () {
    $user = User::factory()->create();

    expect(PermissionRepository::exists('user:update'))->toBeFalse();
    expect($this->instance->update($this->user, $user))->toBeFalse();
});

it('should be able to update a single user', function () {
    $user = User::factory()->create();

    expect(PermissionRepository::exists('user:update'))->toBeFalse();
    expect($this->instance->update($this->admin, $user))->toBeTrue();
});

it('should not be able to delete a single user', function () {
    $user = User::factory()->create();

    expect(PermissionRepository::exists('user:delete'))->toBeFalse();
    expect($this->instance->delete($this->user, $user))->toBeFalse();
});

it('should be able to delete a single user', function () {
    $user = User::factory()->create();

    expect(PermissionRepository::exists('user:delete'))->toBeFalse();

    expect($this->instance->delete($this->admin, $user))->toBeTrue();
});

it('should not be able to delete self', function () {
    $user = User::factory()->create();

    expect(PermissionRepository::exists('user:delete'))->toBeFalse();
    expect($this->instance->delete($this->user, $this->user))->toBeFalse();
    expect($this->instance->delete($this->admin, $this->admin))->toBeFalse();
});
