<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Network;
use Illuminate\Database\Eloquent\Collection;

trait InteractsWithNetworks
{
    /**
     * @return Collection<int, Network>
     */
    public function networks(): Collection
    {
        if ($this->option('chain-id')) {
            return Network::where('chain_id', $this->option('chain-id'))->get();
        }

        return Network::onlyActive()->get();
    }
}
