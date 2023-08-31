<?php

declare(strict_types=1);

use App\Enums\DateFormat;

it('can get all date formats prepared for json', function () {
    $formats = DateFormat::all();

    $now = now();

    expect($formats)->toHaveCount(4);

    expect($formats[0])->toMatchArray([
        'key' => 'd/m/Y',
        'label' => $now->format('d/m/Y'),
        'default' => false,
    ]);

    expect($formats[1])->toMatchArray([
        'key' => 'm/d/Y',
        'label' => $now->format('m/d/Y'),
        'default' => false,
    ]);

    expect($formats[2])->toMatchArray([
        'key' => 'd M Y',
        'label' => $now->format('d M Y'),
        'default' => false,
    ]);

    expect($formats[3])->toMatchArray([
        'key' => 'M d, Y',
        'label' => $now->format('M d, Y'),
        'default' => true,
    ]);
});
