<?php

declare(strict_types=1);

namespace App\Data\Web3;

use App\Enums\NftTransferType;
use Carbon\Carbon;

readonly class CollectionActivity
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
        public string $logIndex,
        public ?NftTransferType $type,
        public Carbon $timestamp,
        public ?float $totalNative,
        public ?float $totalUsd,
        public array $extraAttributes,
    ) {
    }

    public function key(): string
    {
        return implode(':', [
            $this->txHash,
            $this->logIndex,
            $this->tokenId,
            $this->type->value,
        ]);
    }
}
