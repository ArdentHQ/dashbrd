<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Collection;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Policies\CollectionPolicy;

beforeEach(function () {
    $this->instance = new CollectionPolicy();
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();

    $this->admin->assignRole([RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail()]);
});

it('should be able to view collections', function () {
    expect($this->user->hasPermissionTo('user:viewAny', 'admin'))->toBeFalse();
    expect($this->admin->hasPermissionTo('user:viewAny', 'admin'))->toBeTrue();
    expect($this->instance->viewAny($this->user))->toBeFalse();
    expect($this->instance->viewAny($this->admin))->toBeTrue();
});

it('should be able to view a single collection', function () {
    $collection = Collection::factory()->create();

    expect($this->user->hasPermissionTo('collection:view', 'admin', $collection))->toBeFalse();
    expect($this->admin->hasPermissionTo('collection:view', 'admin', $collection))->toBeTrue();
    expect($this->instance->view($this->user, $collection))->toBeFalse();
    expect($this->instance->view($this->admin, $collection))->toBeTrue();
});

it('should not be able to create collections', function () {
    expect($this->instance->create($this->user))->toBeFalse();
    expect($this->instance->create($this->admin))->toBeFalse();
});

it('should be able to update a single collection', function () {
    $collection = Collection::factory()->create();

    expect($this->instance->update($this->user, $collection))->toBeFalse();
    expect($this->instance->update($this->admin, $collection))->toBeTrue();
});

it('should not be able to delete a single collection', function () {
    $collection = Collection::factory()->create();

    expect($this->instance->delete($this->user, $collection))->toBeFalse();
    expect($this->instance->delete($this->admin, $collection))->toBeFalse();
});

it('should not be able to restore a collection', function () {
    $collection = Collection::factory()->create();
    $collection->delete();

    expect($collection->fresh()->deleted_at)->not->toBeNull();
    expect($this->instance->restore($this->user, $collection))->toBeFalse();
    expect($this->instance->restore($this->admin, $collection))->toBeFalse();
});

it('should not be able to force delete an collection', function () {
    $collection = Collection::factory()->create();
    $collection->forceDelete();

    expect($collection->fresh())->toBeNull();
    expect($this->instance->forceDelete($this->user, $collection))->toBeFalse();
    expect($this->instance->forceDelete($this->admin, $collection))->toBeFalse();
});
