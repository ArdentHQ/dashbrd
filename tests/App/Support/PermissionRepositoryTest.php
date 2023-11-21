<?php

declare(strict_types=1);

use App\Support\PermissionRepository;
use Illuminate\Support\Facades\Config;

it('should get all permissions', function () {
    expect(PermissionRepository::all())->toHaveCount(20);
});

it('should cache permissions and refresh every 5 days', function () {
    $config = config('permission.roles');

    expect(PermissionRepository::all())->toHaveCount(20);

    $config['User'] = ['user:test'];

    Config::set('permission.roles', $config);

    expect(PermissionRepository::all())->toHaveCount(20);

    $this->travel(4)->days();

    expect(PermissionRepository::all())->toHaveCount(20);

    $this->travel(1)->days();
    $this->travel(1)->minute();

    expect(PermissionRepository::all())->toHaveCount(21);
});
