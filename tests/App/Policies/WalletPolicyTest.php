<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Models\Wallet;
use App\Policies\WalletPolicy;
use App\Support\PermissionRepository;

beforeEach(function () {
    setUpPermissions();

    $this->instance = new WalletPolicy();
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();

    $this->user->wallet_id = Wallet::factory()->withUser($this->user)->create()->id;
    $this->admin->wallet_id = Wallet::factory()->withUser($this->admin)->create()->id;
    $this->user->save();
    $this->admin->save();

    $this->admin->assignRole([RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail()]);
});

it('should be able to view wallets', function () {
    expect($this->user->hasPermissionTo('user:viewAny', 'admin'))->toBeFalse();
    expect($this->admin->hasPermissionTo('user:viewAny', 'admin'))->toBeTrue();
    expect($this->instance->viewAny($this->user))->toBeFalse();
    expect($this->instance->viewAny($this->admin))->toBeTrue();
});

it('should be able to view a single wallet', function () {
    $wallet = Wallet::factory()->create();

    expect($this->user->hasPermissionTo('user:view', 'admin', $wallet))->toBeFalse();
    expect($this->admin->hasPermissionTo('user:view', 'admin', $wallet))->toBeTrue();
    expect($this->instance->view($this->user, $wallet))->toBeFalse();
    expect($this->instance->view($this->admin, $wallet))->toBeTrue();
});

it('should be able to update own wallet', function () {
    expect($this->instance->update($this->user, $this->user->wallet))->toBeTrue();
});

it('should not be able to create wallets', function () {
    expect($this->instance->create($this->user))->toBeFalse();
    expect($this->instance->create($this->admin))->toBeFalse();
});

it('should not be able to update a single wallet', function () {
    $wallet = Wallet::factory()->create();

    expect($this->instance->update($this->user, $wallet))->toBeFalse();
    expect($this->instance->update($this->admin, $wallet))->toBeFalse();
});

it('should not be able to delete a single wallet', function () {
    $wallet = Wallet::factory()->create();

    expect(PermissionRepository::exists('user:delete'))->toBeFalse();
    expect($this->instance->delete($this->user, $wallet))->toBeFalse();
    expect($this->instance->delete($this->admin, $wallet))->toBeFalse();
});

it('should not be able to restore a single wallet', function () {
    $wallet = Wallet::factory()->create();

    expect($this->instance->restore($this->user, $wallet))->toBeFalse();
    expect($this->instance->restore($this->admin, $wallet))->toBeFalse();
});

it('should not be able to force delete a single wallet', function () {
    $wallet = Wallet::factory()->create();

    expect($this->instance->forceDelete($this->user, $wallet))->toBeFalse();
    expect($this->instance->forceDelete($this->admin, $wallet))->toBeFalse();
});
