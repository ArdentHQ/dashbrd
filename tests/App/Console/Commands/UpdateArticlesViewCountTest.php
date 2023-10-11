<?php

declare(strict_types=1);

use App\Models\Gallery;
use Illuminate\Support\Facades\Queue;

it('dispatches onto the queue', function () {
    Queue::fake();

    $this->artisan('articles:update-view-count');

    Queue::assertClosurePushed(function ($callback) {
        // Verify that closure can be called without errors...
        $closure = $callback->closure;
        $closure();

        return true;
    });
});
