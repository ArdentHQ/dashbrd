<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use Illuminate\Support\Facades\Queue;

it('dispatches onto the queue', function () {
    [$matic] = seedTokens();

    $network = Network::polygon();

    Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => 3.5 * 1e18,
        'floor_price_token_id' => $matic->id,
    ]);

    createUser();

    Queue::fake();

    $this->artisan('collections:update-fiat-value');

    Queue::assertClosurePushed(function ($callback) {
        // Verify that closure can be called without errors...
        $closure = $callback->closure;
        $closure();

        return true;
    });
});

it('updates the collection fiat values', function () {
    [$matic, $sand, $weth] = seedTokens();

    $network = Network::polygon();

    // 1 MATIC = 1.052 USD
    $collectionInMatic = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => 3.5 * 1e18,
        'floor_price_token_id' => $matic->id,
    ]);

    // 1 SAND = 0.601605 USD
    $collectionInSand = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => 1.002 * 1e18,
        'floor_price_token_id' => $sand->id,
    ]);

    // 1 ETH = 1769.02 USD
    $collectionInWeth = Collection::factory()->create([
        'network_id' => $network->id,
        'floor_price' => 2.1 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);

    $user = createUser();

    $user2 = createUser();

    // Assign three collections to user one
    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collectionInWeth->id,
    ]);
    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collectionInSand->id,
    ]);
    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collectionInMatic->id,
    ]);

    Nft::factory()->count(2)->create([
        'wallet_id' => $user2->wallet_id,
        'collection_id' => $collectionInMatic->id,
    ]);

    $this->artisan('collections:update-fiat-value');

    expect(round($collectionInWeth->fresh()->fiatValue(CurrencyCode::USD), 2))->toBe(round(2.1 * 1769.02, 2));
    expect(round($collectionInMatic->fresh()->fiatValue(CurrencyCode::USD), 2))->toBe(round(3.5 * 1.052, 2));
    expect(round($collectionInSand->fresh()->fiatValue(CurrencyCode::USD), 2))->toBe(round(1.002 * 0.601605, 2));
});
