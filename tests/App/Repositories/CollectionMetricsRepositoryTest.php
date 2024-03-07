<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\Nft;
use App\Repositories\CollectionMetricsRepository;

it("can calculate the total fiat amount for user's collections", function () {
    [$matic, , $weth] = seedTokens();

    $user = createUser();
    $user2 = createUser();
    $user3 = createUser();

    // 1 MATIC = 1.052 USD
    $userCollection = Collection::factory()->create([
        'floor_price' => 3.5 * 1e18,
        'floor_price_token_id' => $matic->id,
    ]);

    Collection::factory()->count(2)->create();

    // 1 ETH = 1769.02 USD
    $userCollection2 = Collection::factory()->create([
        'floor_price' => 2.1 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    // For another user
    Nft::factory()->create([
        'wallet_id' => $user2->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    // 5 items from the same collection for another user
    Nft::factory()->count(5)->create([
        'wallet_id' => $user3->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    $metrics = new CollectionMetricsRepository;

    Collection::updateFiatValue();

    expect(round($metrics->forUser($user, showHidden: false)->value, 2))->toBe(
        round(3.5 * 1.052 + 2.1 * 1769.02, 2)
    );

    expect(round($metrics->forUser($user2, showHidden: false)->value, 2))->toBe(
        round(2.1 * 1769.02, 2)
    );

    expect(round($metrics->forUser($user3, showHidden: false)->value, 2))->toBe(
        round(3.5 * 1.052 * 5, 2)
    );
});
