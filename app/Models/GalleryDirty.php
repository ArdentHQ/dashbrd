<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryDirty extends Model
{
    protected $table = 'galleries_dirty';

    protected $primaryKey = 'gallery_id';

    public $incrementing = false;
}
