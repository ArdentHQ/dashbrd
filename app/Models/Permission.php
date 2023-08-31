<?php

declare(strict_types=1);

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatieModel;

class Permission extends SpatieModel
{
    /**
     * @param  array<string, string>  $attributes
     */
    public function __construct(array $attributes = [])
    {
        $attributes['guard_name'] = 'admin';

        parent::__construct($attributes);
    }
}
