<?php

declare(strict_types=1);

use App\Enums\Role;

it('should return the label', function (Role $role, string $expected) {
    expect($role->label())->toBe($expected);
})->with([
    [Role::Superadmin, 'Super Administrator'],
    [Role::Admin, 'Administrator'],
]);
