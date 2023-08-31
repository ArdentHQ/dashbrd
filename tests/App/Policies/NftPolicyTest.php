<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Nft;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Policies\NftPolicy;

beforeEach(function () {
    setUpPermissions();

    $this->instance = new NftPolicy();
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();

    $this->admin->assignRole([RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail()]);
});

it('should be able to view nfts', function () {
    expect($this->user->hasPermissionTo('user:viewAny', 'admin'))->toBeFalse();
    expect($this->admin->hasPermissionTo('user:viewAny', 'admin'))->toBeTrue();
    expect($this->instance->viewAny($this->user))->toBeFalse();
    expect($this->instance->viewAny($this->admin))->toBeTrue();
});

it('should be able to view a single nft', function () {
    $nft = Nft::factory()->create();

    expect($this->user->hasPermissionTo('user:view', 'admin', $nft))->toBeFalse();
    expect($this->admin->hasPermissionTo('user:view', 'admin', $nft))->toBeTrue();
    expect($this->instance->view($this->user, $nft))->toBeFalse();
    expect($this->instance->view($this->admin, $nft))->toBeTrue();
});

it('should not be able to create nfts', function () {
    expect($this->instance->create($this->user))->toBeFalse();
    expect($this->instance->create($this->admin))->toBeFalse();
});

it('should not be able to update a single nft', function () {
    $nft = Nft::factory()->create();

    expect($this->instance->update($this->user, $nft))->toBeFalse();
    expect($this->instance->update($this->admin, $nft))->toBeFalse();
});

it('should not be able to delete a single nft', function () {
    $nft = Nft::factory()->create();

    expect($this->instance->delete($this->user, $nft))->toBeFalse();
    expect($this->instance->delete($this->admin, $nft))->toBeFalse();
});

it('should not be able to restore a nft', function () {
    $nft = Nft::factory()->create();
    $nft->delete();

    expect($nft->fresh()->deleted_at)->not->toBeNull();
    expect($this->instance->restore($this->user, $nft))->toBeFalse();
    expect($this->instance->restore($this->admin, $nft))->toBeFalse();
});

it('should not be able to force delete an nft', function () {
    $nft = Nft::factory()->create();
    $nft->forceDelete();

    expect($nft->fresh())->toBeNull();
    expect($this->instance->forceDelete($this->user, $nft))->toBeFalse();
    expect($this->instance->forceDelete($this->admin, $nft))->toBeFalse();
});
