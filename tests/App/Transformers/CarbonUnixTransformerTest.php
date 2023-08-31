<?php

declare(strict_types=1);

use App\Data\TokenListItemData;
use App\Transformers\CarbonUnixTransformer;
use Carbon\Carbon;
use Spatie\LaravelData\Support\DataProperty;

it('can transform carbon objects to unix timestamps', function () {
    $transformer = new CarbonUnixTransformer();
    $dataProperty = DataProperty::create(new ReflectionProperty(TokenListItemData::class, 'balance'));

    $date = Carbon::parse('2023-01-01');

    expect($transformer->transform($dataProperty, $date))->toBe($date->unix());
});
