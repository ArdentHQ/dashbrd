<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Network;
use App\Models\NftActivity;
use App\Models\TokenPriceHistory;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

it('dispatches a job for nft activities', function () {
    Carbon::setTestNow(Carbon::now()->startOfYear());

    $network = Network::query()->where('chain_id', 137)->find(1);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $extraAttributes = [
        'sender' => [
            'type' => 'TYPE_OWNER',
            'address' => '0x0000000000000000000000000000000000000000',
        ],
        'recipient' => [
            'type' => 'TYPE_OWNER',
            'address' => '0x7aa7ce4a1ddd38e1f87498959e164b6e1607bc5d',
        ],
        'recipientPaid' => [
            'totalUsd' => '1.4860810185415954',
            'totalNative' => '1',
            'attributedBy' => 'ATTRIBUTED_BY_SINGLE_TRANSFER',
            'fungibleTotals' => [],
            'nativeTransfersTotal' => '2',
            'fungibleTransfersTotal' => '0',
        ],
        'senderReceived' => [
            'totalUsd' => '0',
            'totalNative' => '0',
            'attributedBy' => 'ATTRIBUTED_BY_NO_PAYMENTS',
            'fungibleTotals' => [],
            'nativeTransfersTotal' => '0',
            'fungibleTransfersTotal' => '0',
        ],
    ];

    $priceData = [
        ['price' => 0, 'daysAgo' => 4],
        ['price' => 300, 'daysAgo' => 0],
    ];

    foreach ($priceData as $data) {
        $timestamp = Carbon::now()->subDays($data['daysAgo']);

        TokenPriceHistory::factory()->create([
            'token_guid' => 'ethereum',
            'currency' => 'usd',
            'price' => $data['price'],
            'timestamp' => $timestamp,
        ]);

        NftActivity::factory()->create([
            'type' => 'LABEL_TRANSFER',
            'timestamp' => $timestamp->addHour(),
            'extra_attributes' => $extraAttributes,
            'collection_id' => $collection->id,
            'total_native' => null,
            'total_usd' => null,
        ]);
    }

    $this->artisan('activities:sync-prices');

    $activities = NftActivity::where('collection_id', $collection->id)->get()->sortBy('timestamp');

    expect($activities->count())->toBe(2);

    $activities->each(function ($activity, $index) use ($priceData) {
        $price = (string) $priceData[$index]['price'];

        expect($activity->total_native)->toBe('1');
        expect($activity->total_usd)->toBe($price);
    });

    Carbon::setTestNow(null);
});

it('handles an exception and rolls back the transaction', function () {
    DB::shouldReceive('beginTransaction')->once();
    DB::shouldReceive('statement')->once()->andThrow(new \Exception('An error occurred while updating the NFT activity table'));
    DB::shouldReceive('rollBack')->once();

    $this->artisan('activities:sync-prices')->expectsOutput('An error occurred while updating the NFT activity table: An error occurred while updating the NFT activity table')->assertExitCode(1);
});
