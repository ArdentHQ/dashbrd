<?php

declare(strict_types=1);

namespace App\Http\Client\Opensea\Data;

class OpenseaNftDetails
{
    /**
     * @see https://docs.opensea.io/reference/get-an-nft
     *
     * @param array{
     *   collection: string
     * } $responseData (see docs for detailed response structure)
     */
    public function __construct(private array $responseData)
    {
    }

    public function collectionSlug(): string
    {
        return $this->responseData['collection'];
    }
}
