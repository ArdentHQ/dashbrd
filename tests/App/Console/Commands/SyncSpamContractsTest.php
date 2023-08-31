<?php

declare(strict_types=1);

use App\Models\Network;
use App\Models\SpamContract;
use App\Support\Facades\Alchemy;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

beforeEach(function () {
    Alchemy::fake(function (Request $request) {
        if ($request->method() == 'GET') {
            $path = $request->toPsrRequest()->getUri()->getPath();
            if (Str::contains($path, 'getSpamContracts')) {
                return Http::response([
                    '0x000000000a42c2791eec307fff43fa5c640e3ef7',
                    '0x000294f162dc337cf060ac6e2cb7db8c8f544004',
                    '0x000386e3f7559d9b6a2f5c46b4ad1a9587d59dc3',
                ], 200);
            }
        }

        return Http::response(null, 404);
    });
});

it('should store spam contracts in database', function () {
    $this->artisan('sync-spam-contracts');

    expect(SpamContract::query()->count())->toBe(3);
});

it('should delete addresses from database that are no longer classified as spam', function () {
    $ethNetwork = Network::query()->where('chain_id', 1)->first();

    SpamContract::query()->insert([
        ['address' => '0x000000000a42c2791eec307fff43fa5c640e3ef7', 'network_id' => $ethNetwork->id],
        ['address' => '0x000000000a42c2791eec307fff43fa5c640e3del', 'network_id' => $ethNetwork->id],
    ]);

    $this->artisan('sync-spam-contracts --chain-id=1');

    expect(SpamContract::query()->where('network_id', $ethNetwork->id)->count())->toBe(3)
        ->and(SpamContract::query()->where('address',
            '0x000000000a42c2791eec307fff43fa5c640e3del')->first())->toBeNull();
});
