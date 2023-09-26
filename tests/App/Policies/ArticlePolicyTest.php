<?php

declare(strict_types=1);

use App\Enums\Role;
use App\Models\Article;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Policies\ArticlePolicy;

beforeEach(function () {
    setUpPermissions();

    $this->instance = new ArticlePolicy();

    $this->user = User::factory()->create();
    $this->admin = User::factory()->create();
    $this->editor = User::factory()->create();

    $this->editor->assignRole([
        RoleModel::where('name', Role::Editor->value)->where('guard_name', 'admin')->firstOrFail(),
    ])->save();

    $this->admin->assignRole([
        RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail(),
    ])->save();

});

it('should not be able to view articles', function () {
    expect($this->instance->viewAny($this->user))->toBeFalse();
    expect($this->user->hasPermissionTo('article:viewAny', 'admin'))->toBeFalse();
});

it('should be able to view articles', function () {
    expect($this->instance->viewAny($this->admin))->toBeTrue();
    expect($this->admin->hasPermissionTo('article:viewAny', 'admin'))->toBeTrue();
});

it('should not be able to view a single article', function () {
    $article = Article::factory()->create();

    expect($this->user->hasPermissionTo('article:viewAny', 'admin'))->toBeFalse();
    expect($this->instance->view($this->user, $article))->toBeFalse();
});

it('should be able to view a single article', function () {
    $article = Article::factory()->create();

    expect($this->admin->hasPermissionTo('article:viewAny', 'admin'))->toBeTrue();
    expect($this->instance->view($this->admin, $article))->toBeTrue();
});

it('should be able to update own article', function () {
    $article = Article::factory()->create([
        'user_id' => $this->editor->id,
    ]);

    expect($this->instance->update($this->editor, $article))->toBeTrue();
});

it('should not be able to create articles', function () {
    expect($this->instance->create($this->user))->toBeFalse();
});

it('should be able to create articles', function () {
    expect($this->editor->hasPermissionTo('article:create', 'admin'))->toBeTrue();

    expect($this->instance->create($this->admin))->toBeTrue();
    expect($this->instance->create($this->editor))->toBeTrue();
});

it('should not be able to update a single article', function () {
    $article = Article::factory()->create();

    expect($this->instance->update($this->user, $article))->toBeFalse();
    expect($this->instance->update($this->editor, $article))->toBeFalse();
});

it('should be able to update a single article', function () {
    $article = Article::factory()->create();

    expect($this->instance->update($this->admin, $article))->toBeTrue();
});

it('should be able to update a single article that owns', function () {
    $article = Article::factory()->create([
        'user_id' => $this->editor->id,
    ]);

    expect($this->instance->update($this->editor, $article))->toBeTrue();
});

it('should not be able to delete a single article', function () {
    $article = Article::factory()->create();

    expect($this->instance->delete($this->user, $article))->toBeFalse();
    expect($this->instance->delete($this->editor, $article))->toBeFalse();
});

it('should be able to delete a single article', function () {
    $article = Article::factory()->create();

    expect($this->instance->delete($this->admin, $article))->toBeTrue();
});

it('should be able to delete a single article that owns', function () {
    $article = Article::factory()->create([
        'user_id' => $this->editor->id,
    ]);

    expect($this->instance->delete($this->editor, $article))->toBeTrue();
});

it('should not be able to restore a single article', function () {
    $article = Article::factory()->create();

    expect($this->instance->restore($this->user, $article))->toBeFalse();
    expect($this->instance->restore($this->editor, $article))->toBeFalse();
});

it('should be able to restore a single article', function () {
    $article = Article::factory()->create();

    expect($this->instance->restore($this->admin, $article))->toBeTrue();
});

it('should not be able to restore an article', function () {
    $article = Article::factory()->create([
        'user_id' => $this->editor->id,
    ]);

    expect($this->instance->restore($this->editor, $article))->toBeFalse();
});

it('should not be able to forceDelete a single article', function () {
    $article = Article::factory()->create();

    expect($this->instance->forceDelete($this->user, $article))->toBeFalse();
    expect($this->instance->forceDelete($this->editor, $article))->toBeFalse();
});

it('should be able to forceDelete a single article', function () {
    $article = Article::factory()->create();

    expect($this->instance->forceDelete($this->admin, $article))->toBeTrue();
});

it('should not be able to forceDelete a single', function () {
    $article = Article::factory()->create([
        'user_id' => $this->editor->id,
    ]);

    expect($this->instance->forceDelete($this->editor, $article))->toBeFalse();
});
