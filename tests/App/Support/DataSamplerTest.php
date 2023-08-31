<?php

declare(strict_types=1);

use App\Support\DataSampler;

it('gets a sample of the data', function ($data, $expectedSample) {
    $sample = DataSampler::sample($data, 5);

    expect($sample)->toEqual($expectedSample);
})->with([
    [range(1, 10), [1, 3, 5, 7, 10]],
    [range(8, 188), [8, 53, 98, 143, 188]],
]);

it('gets a sample of the data if sample is lower than data', function ($sampleCount, $expectedSample) {
    // Data has 4 items
    $data = range(1, 4);

    $sample = DataSampler::sample($data, $sampleCount);

    expect($sample)->toEqual($expectedSample);
})->with([
    [0, []],
    [1, [1]],
    [2, [1, 4]],
    [3, [1, 3, 4]],
    [4, [1, 2, 3, 4]],
]);

it('gets a sample of the data if sample is larger than data', function ($data, $expectedSample) {
    $sample = DataSampler::sample($data, 4);

    expect($sample)->toEqual($expectedSample);
})->with([
    [[], []],
    [['a'], ['a']],
    [['a', 'b'], ['a', 'b']],
    [['a', 'b', 'c'], ['a', 'b', 'c']],
    [['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd']],
]);
