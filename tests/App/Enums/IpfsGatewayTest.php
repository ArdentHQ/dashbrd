<?php

declare(strict_types=1);

use App\Enums\IpfsGateway;

it('should format gateway url with cid for cloudflare', function (string $cid, string $expected) {
    expect(IpfsGateway::Cloudflare->format($cid))->toBe($expected);
})->with([
    'with ipfs scheme' => [
        'ipfs://QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
        'https://cloudflare-ipfs.com/ipfs/QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
    ],
    'with ipfs scheme & folder' => [
        'ipfs://QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
        'https://cloudflare-ipfs.com/ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
    ],
    'with ipfs path prefix' => [
        'ipfs://ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
        'https://cloudflare-ipfs.com/ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
    ],
]);

it('should trim cid', function (string $cid, string $expected) {
    $method = new \ReflectionMethod(IpfsGateway::class, 'parse');
    $parsedValue = $method->invoke(null, $cid);

    expect($parsedValue)->toBe($expected);
})->with([
    'with ipfs scheme' => [
        'ipfs://QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
        'QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
    ],
    'with ipfs scheme & folder' => [
        'ipfs://QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
        'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
    ],
    'with ipfs path prefix' => [
        'ipfs://ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
        'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
    ],
]);

it('should return full cid if does not match regex', function (string $url) {
    $method = new \ReflectionMethod(IpfsGateway::class, 'parse');
    $parsedValue = $method->invoke(null, $url);

    expect($parsedValue)->toBeNull();
})->with([
    'with invalid scheme' => 'ipfs:/QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
    'without a scheme' => 'ipfs.io/ipfs/QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
    'with http scheme' => 'http://ipfs.io/ipfs/QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
    'with a random prefix' => 'random-prefix/QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
    'without any prefix' => 'QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
    'without domain' => 'ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
    'without domain with leading slash' => '/ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
    'with https scheme' => 'https://ipfs.io/ipfs/QmZXDaL6zs5eAZ38qNNKW3EhsHFH9TFb8Tk2zoMEUzP3oe/2997.png',
    'with https scheme & folder' => 'https://ipfs.io/ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX/wiki/Mars.html',
]);
