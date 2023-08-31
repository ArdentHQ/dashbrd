<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use Illuminate\Support\Facades\Queue;

it('dispatches onto the queue', function () {
    Queue::fake();

    $this->artisan('galleries:update-value');

    Queue::assertClosurePushed(function ($callback) {
        // Verify that closure can be called without errors...
        $closure = $callback->closure;
        $closure();

        return true;
    });
});

it('updates the gallery values', function () {
    [$matic, $sand, $weth] = seedTokens();

    // 1 MATIC = 1.052 USD
    $collectionInMatic = Collection::factory()->create([
        'floor_price' => 3.5 * 1e18,
        'floor_price_token_id' => $matic->id,
    ]);

    // 1 SAND = 0.601605 USD
    $collectionInSand = Collection::factory()->create([
        'floor_price' => 1.002 * 1e18,
        'floor_price_token_id' => $sand->id,
    ]);

    // 1 ETH = 1769.02 USD
    $collectionInWeth = Collection::factory()->create([
        'floor_price' => 2.1 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);

    // (2.1 WETH * 1769.02 USD) + (1.0002 SAND * 0.601605 USD)
    $gallery1 = Gallery::factory()->create();
    $gallery1->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInWeth->id])->id, ['order_index' => 1]);
    $gallery1->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInSand->id])->id, ['order_index' => 2]);

    // (3.5 MATIC * 1.052 USD) + (2.1 WETH * 1769.02 USD) + (3.5 MATIC * 1.052 USD)
    $gallery2 = Gallery::factory()->create();
    $gallery2->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInMatic->id])->id, ['order_index' => 1]);
    $gallery2->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInWeth->id])->id, ['order_index' => 2]);
    $gallery2->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInMatic->id])->id, ['order_index' => 3]);

    // (1.002 SAND * 0.601605 USD) * 3
    $gallery3 = Gallery::factory()->create();
    $gallery3->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInSand->id])->id, ['order_index' => 1]);
    $gallery3->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInSand->id])->id, ['order_index' => 2]);
    $gallery3->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInSand->id])->id, ['order_index' => 3]);

    $gallery4 = Gallery::factory()->create();

    // (3.5 MATIC * 1.052 USD)
    $gallery5 = Gallery::factory()->create();
    $gallery5->nfts()->attach(Nft::factory()->create(['collection_id' => $collectionInMatic->id])->id, ['order_index' => 1]);

    expect((float) $gallery1->fresh()->value(CurrencyCode::USD))->toBe(0.0);
    expect((float) $gallery2->fresh()->value(CurrencyCode::USD))->toBe(0.0);
    expect((float) $gallery3->fresh()->value(CurrencyCode::USD))->toBe(0.0);
    expect((float) $gallery4->fresh()->value(CurrencyCode::USD))->toBe(0.0);
    expect((float) $gallery5->fresh()->value(CurrencyCode::USD))->toBe(0.0);

    $this->artisan('galleries:update-value');

    expect(round($gallery1->fresh()->value(CurrencyCode::USD), 2))->toBe(round((2.1 * 1769.02) + (1.0002 * 0.601605), 2));
    expect(round($gallery2->fresh()->value(CurrencyCode::USD), 2))->toBe(round(3.5 * 1.052 + 2.1 * 1769.02 + 3.5 * 1.052, 2));
    expect(round($gallery3->fresh()->value(CurrencyCode::USD), 2))->toBe(round(1.002 * 0.601605 * 3, 2));
    expect($gallery4->fresh()->value(CurrencyCode::USD))->toBeNull();
    expect(round($gallery5->fresh()->value(CurrencyCode::USD), 2))->toBe(round(3.5 * 1.052, 2));
});
