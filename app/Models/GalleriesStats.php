<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleriesStats extends Model
{
    public function totalGalleries(): int
    {
        return $this->attributes['total_galleries'];
    }

    public function totalDistinctUsers(): int
    {
        return $this->attributes['total_distinct_users'];
    }

    public function totalDistinctCollections(): int
    {
        return $this->attributes['total_distinct_collections'];
    }

    public function totalDistinctNfts(): int
    {
        return $this->attributes['total_distinct_nfts'];
    }
}
