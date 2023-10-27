<?php

declare(strict_types=1);

namespace App\Support;

use App\Enums\ImageSize;

final class NftImageUrl
{
    /**
     * @param  ?string  $url
     * @return array{thumb: string | null, small: string | null, large: string | null}
     */
    public static function getAllSizes(?string $url): array
    {
        /** @var array{thumb: string | null, small: string | null, large: string | null} $result */
        $result = collect(ImageSize::defaultList())
            ->mapWithKeys(fn ($size) => [$size->value => ($url ? self::get($url, $size) : null)])
            ->all();

        return $result;
    }

    public static function get(string $url, ?ImageSize $imageSize): string
    {
        $cdns = [
            'getAlchemyCdn',
            'getOpenSeaCdn',
            'getMoralisCdn',
        ];

        foreach ($cdns as $cdn) {
            $result = self::$cdn($url, $imageSize);
            if ($result) {
                return $result;
            }
        }

        return $url;
    }

    private static function getAlchemyCdn(string $url, ?ImageSize $imageSize): ?string
    {
        // https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/f065afd5cf799f4ab1252111f8f3d38c
        if (! preg_match('/^https:\/\/res\.cloudinary\.com\/alchemyapi\/image\/upload\/thumbnailv2\/.*/', $url)) {
            return null;
        }

        if ($imageSize) {
            // https://docs.alchemy.com/reference/nft-api-faq#how-does-image-resizing-work
            /** @var array<string, string> $parts */
            $parts = parse_url($url);
            $path = $parts['path'];

            $size = 'w_'.$imageSize->width().',h_'.$imageSize->height();
            $newPath = preg_replace('/(?<=\/)upload(?=\/)/', "upload/{$size}", $path);
            $scaledPath = preg_replace('/thumbnailv2/', "scaled", $newPath);

            $url = str_replace($path, $scaledPath, $url);
        }

        return $url;
    }

    private static function getOpenSeaCdn(string $url, ?ImageSize $imageSize): ?string
    {
        // https://i.seadn.io/gcs/files/5ff2b7fa5c94616f34a27e37eadfbfd1.png?h=256&w=96&auto=format
        if (! preg_match('/^https:\/\/i\.seadn\.io\/.*/', $url)) {
            return null;
        }

        if ($imageSize) {
            $url = preg_replace('/(?<=\?)w=\d+/', 'w='.$imageSize->width(), $url);
            $url = preg_replace('/(?<=\?)h=\d+/', 'h='.$imageSize->height(), $url);
        }

        return $url;
    }

    private static function getMoralisCdn(string $url, ?ImageSize $imageSize): ?string
    {
        if (! preg_match('/^https:\/\/nft-preview-media\.s3\.us-east-1\.amazonaws\.com\/.*/', $url)) {
            return null;
        }

        // (reference)
        //
        // "low": {
        //   "url": "https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/low.jpeg",
        //   "width": 100,
        //   "height": 100
        // },
        // "medium": {
        //   "url": "https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/medium.jpeg",
        //   "width": 250,
        //   "height": 250
        // },
        // "high": {
        //   "url": "https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xc54567b294d7ec7807529fbaec71d326543453c5/0xbecb6f250337775b7d85ef2720d80dfc2f4e0c3a94ee2486038fd5e8ac1b43d6/high.jpeg",
        //   "width": 500,
        //   "height": 500
        // }
        //
        $extension = pathinfo($url, PATHINFO_EXTENSION);
        $filename = basename($url, ".{$extension}");
        $baseUrl = str_replace("/{$filename}.{$extension}", '', $url);

        if ($imageSize || empty($extension)) {
            $moralisSize = match ($imageSize ?? ImageSize::Large) {
                ImageSize::Thumb => 'low',
                ImageSize::Small => 'medium',
                ImageSize::Large => 'high',
                ImageSize::Banner => 'high',
            };

            $url = "{$baseUrl}/{$moralisSize}.jpeg";
        }

        return $url;
    }
}
