<?php

declare(strict_types=1);

use App\Models\Network;
use App\Models\SpamContract;

it('should detect if address is spam', function ($address, $result) {
    /** @var Network $network */
    $network = Network::factory()->create();

    SpamContract::query()->create([
        'address' => '0x000000000a42c2791eec307fff43fa5c640e3ef7',
        'network_id' => $network->id,
    ]);

    expect(SpamContract::isSpam($address, $network))->toBe($result);
})->with([
    ['0x000000000a42c2791eec307fff43fa5c640e3ef7', true],
    ['0x000000000a42c2791eec307fff43fa5c640e3not', false],
]);
