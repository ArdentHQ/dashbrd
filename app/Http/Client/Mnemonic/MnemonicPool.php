<?php

declare(strict_types=1);

namespace App\Http\Client\Mnemonic;

use GuzzleHttp\Promise\Promise;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;

class MnemonicPool extends Pool
{
    public function getNftCollectionVolumeRequest(string $contractAddress, string $duration): Response|Promise
    {
        if (! in_array($duration, ['DURATION_1_DAY', 'DURATION_7_DAYS', 'DURATION_30_DAYS'])) {
            throw new \Exception('Invalid duration');
        }

        return $this->get(sprintf(
            '/collections/v1beta2/%s/sales_volume/%s/GROUP_BY_PERIOD_1_DAY',
            $contractAddress,
            $duration,
        ), []);
    }
}
