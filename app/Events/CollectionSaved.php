<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Collection;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CollectionSaved
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Collection $collection,
    ) {
    }
}
