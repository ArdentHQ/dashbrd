<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class WalletAddressDetails extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    /**
     * @var array<string>
     */
    protected $fillable = [
        'domain',
    ];

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('avatar')
            ->singleFile()
            ->registerMediaConversions(function (Media $media) {
                $this
                    ->addMediaConversion('small')
                    ->width(20)
                    ->height(20);

                $this
                    ->addMediaConversion('small@2x')
                    ->width(40)
                    ->height(40);
            });
    }
}
