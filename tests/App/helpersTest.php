<?php

declare(strict_types=1);

it('returns the content of the sql file', function () {
    $contents = get_query('gallery.calculate_score');

    expect($contents)->toContain('SELECT');
});

it('throws an exception if file does not exist', function () {
    get_query('typo.in.the.name');
})->throws(Exception::class);

it('can compile blade template', function () {
    $contents = get_query('test', [
        'id' => 'test',
    ]);

    expect($contents)->toBe("select * from users where id = 'test'".PHP_EOL);
});
