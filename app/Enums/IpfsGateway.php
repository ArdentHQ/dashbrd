<?php

declare(strict_types=1);

namespace App\Enums;

enum IpfsGateway: string
{
    /**
     * @var string
     */
    const CID_REGEX = '/^ipfs:\/\/(ipfs\/)?(.+)$/';

    case Cloudflare = 'Cloudflare';

    public function format(string $cid): string
    {
        $parsedCid = self::parse($cid);
        if ($parsedCid === null) {
            return $cid;
        }

        return match ($this) {
            self::Cloudflare => sprintf('https://cloudflare-ipfs.com/ipfs/%s', $parsedCid),
        };
    }

    private static function parse(string $cid): ?string
    {
        if (preg_match(self::CID_REGEX, $cid, $matches)) {
            return $matches[2];
        }

        return null;
    }
}
