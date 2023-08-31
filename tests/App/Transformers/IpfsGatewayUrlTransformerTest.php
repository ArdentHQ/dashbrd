<?php

declare(strict_types=1);

use App\Data\Collections\CollectionData;
use App\Transformers\IpfsGatewayUrlTransformer;
use Spatie\LaravelData\Support\DataProperty;

it('can transform ipfs cids into gateway urls', function (string $cid, string $expected) {
    $transformer = new IpfsGatewayUrlTransformer();
    $dataProperty = DataProperty::create(new ReflectionProperty(CollectionData::class, 'image'));

    expect($transformer->transform($dataProperty, $cid))->toBe($expected);
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

it('does not transform non-ipfs cids into gateway urls', function ($url) {
    $transformer = new IpfsGatewayUrlTransformer();
    $dataProperty = DataProperty::create(new ReflectionProperty(CollectionData::class, 'image'));

    expect($transformer->transform($dataProperty, $url))->toBe($url);
})->with([
    'http url' => 'https://psychonautznft.com/detail/1157',
    'http image' => 'https://i.seadn.io/gcs/files/64210c963542191ba508a8e048481245.png?w=500&auto=format',
    'random string' => 'random string',
    'null' => null,
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
