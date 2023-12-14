<?php

declare(strict_types=1);

use App\Models\FloorPriceHistory;

it('prunes models older than the month', function () {
    $old = FloorPriceHistory::factory()->create([
        'retrieved_at' => now()->subMonth()->subDays(2),
    ]);

    FloorPriceHistory::factory()->create([
        'retrieved_at' => now()->subMonth(),
    ]);

    FloorPriceHistory::factory()->create([
        'retrieved_at' => now()->subWeek(),
    ]);

    $this->artisan('model:prune', [
        '--model' => FloorPriceHistory::class,
    ]);

    expect(FloorPriceHistory::count())->toBe(2);
    expect($old->fresh())->toBeNull();
});
