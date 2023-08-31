<?php

declare(strict_types=1);

namespace App\Data\Web3;

use App\Enums\NftTransferType;
use Carbon\Carbon;
use Spatie\LaravelData\Data;

class Web3NftTransfer extends Data
{
    /**
     * @param  array<string, mixed>  $extraAttributes
     */
    public function __construct(
        public string $contractAddress,
        public string $tokenId,
        public string $sender,
        public string $recipient,
        public string $txHash,
        public NftTransferType $type,
        public Carbon $timestamp,
        public ?float $totalNative,
        public ?float $totalUsd,
        public array $extraAttributes,
    ) {
    }
}
