<?php

declare(strict_types=1);

use App\Models\Gallery;
use App\Models\Report;
use App\Models\User;
use App\Notifications\GalleryReport;
use Illuminate\Support\Facades\Notification;

it('can get report reasons', function () {
    expect(Report::reasons())->toBeArray();
});

it('belongs to the user', function () {
    expect(Report::factory()->create()->user)->toBeInstanceOf(User::class);
});

it('belongs to the gallery', function () {
    expect(Report::factory()->create()->subject)->toBeInstanceOf(Gallery::class);
});

it('notifies via slack when report is created', function () {
    config([
        'dashbrd.reports.enabled' => true,
    ]);

    Report::factory()->create();

    Notification::assertSentTimes(GalleryReport::class, 1);
});
