<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Gallery;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Policies\GalleryPolicy;
use App\Support\PermissionRepository;

beforeEach(function () {
    $this->instance = new GalleryPolicy();
    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();

    $this->user->save();
    $this->admin->save();

    $this->admin->assignRole([RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail()]);
});

it('should be able to view gallerys', function () {
    expect($this->user->hasPermissionTo('user:viewAny', 'admin'))->toBeFalse();
    expect($this->admin->hasPermissionTo('user:viewAny', 'admin'))->toBeTrue();
    expect($this->instance->viewAny($this->user))->toBeFalse();
    expect($this->instance->viewAny($this->admin))->toBeTrue();
});

it('should be able to view a single gallery', function () {
    $gallery = Gallery::factory()->create();

    expect($this->user->hasPermissionTo('user:view', 'admin', $gallery))->toBeFalse();
    expect($this->admin->hasPermissionTo('user:view', 'admin', $gallery))->toBeTrue();
    expect($this->instance->view($this->user, $gallery))->toBeFalse();
    expect($this->instance->view($this->admin, $gallery))->toBeTrue();
});

it('should be able to update own gallery', function () {
    $gallery = Gallery::factory()->create([
        'user_id' => $this->user->id,
    ]);

    expect($this->instance->update($this->user, $gallery))->toBeTrue();
});

it('should be able to delete own gallery', function () {
    $gallery = Gallery::factory()->create([
        'user_id' => $this->user->id,
    ]);

    expect($this->instance->delete($this->user, $gallery))->toBeTrue();
});

it('should be able to update a single gallery', function () {
    $gallery = Gallery::factory()->create();

    expect(PermissionRepository::exists('user:update'))->toBeFalse();
    expect($this->instance->update($this->user, $gallery))->toBeFalse();
    expect($this->instance->update($this->admin, $gallery))->toBeTrue();
});

it('should be able to create gallery', function () {
    expect($this->instance->create($this->user))->toBeFalse();
    expect($this->instance->create($this->admin))->toBeTrue();
});

it('should be able to delete a single gallery', function () {
    $gallery = Gallery::factory()->create();

    expect(PermissionRepository::exists('user:delete'))->toBeFalse();
    expect($this->instance->delete($this->user, $gallery))->toBeFalse();
    expect($this->instance->delete($this->admin, $gallery))->toBeTrue();
});
