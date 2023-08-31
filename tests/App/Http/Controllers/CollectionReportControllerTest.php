<?php

declare(strict_types=1);

use App\Enums\ToastType;
use App\Models\Collection;
use App\Models\Report;

it('can create a new report', function () {
    $user = createUser();
    $collection = Collection::factory()->create();

    expect($collection->reports()->count())->toBe(0);

    $this->actingAs($user)->post(route('collection-reports.create', $collection), [
        'reason' => 'spam',
    ]);

    expect($collection->reports()->count())->toBe(1);

    $report = $collection->reports()->first();

    expect($report->user->is($user))->toBeTrue();
    expect($report->reason)->toBe('spam');
});

it('requires a reason', function () {
    $user = createUser();
    $collection = Collection::factory()->create();

    expect($collection->reports()->count())->toBe(0);

    $this->actingAs($user)->post(route('collection-reports.create', $collection), [
        'reason' => '',
    ])->assertSessionHasErrors('reason');

    expect($collection->reports()->count())->toBe(0);
});

it('requires a valid reason', function () {
    $user = createUser();
    $collection = Collection::factory()->create();

    expect($collection->reports()->count())->toBe(0);

    $this->actingAs($user)->post(route('collection-reports.create', $collection), [
        'reason' => 'invalid',
    ])->assertSessionHasErrors('reason');

    expect($collection->reports()->count())->toBe(0);
});

it('should throttle 1 report per day per collection', function () {
    $user = createUser();
    $collection = Collection::factory()->create();
    $secondCollection = Collection::factory()->create();

    expect($collection->reports()->count())->toBe(0);

    $this->actingAs($user)
        ->post(route('collection-reports.create', $collection), [
            'reason' => 'spam',
        ]);

    $this->actingAs($user)
        ->post(route('collection-reports.create', $collection), [
            'reason' => 'spam',
        ])
        ->assertSessionHas([
            'toast:message' => trans('pages.reports.throttle', [
                'time' => trans_choice('common.n_hours', 23, ['count' => 23]),
            ]),
            'toast:type' => ToastType::Warning->value,
        ]);

    expect($collection->reports()->count())->toBe(1);

    $report = $collection->reports()->first();

    expect($report->user->is($user))->toBeTrue();
    expect($report->reason)->toBe('spam');

    $this->actingAs($user)
        ->post(route('collection-reports.create', $secondCollection), [
            'reason' => 'spam',
        ]);

    $this->actingAs($user)
        ->post(route('collection-reports.create', $secondCollection), [
            'reason' => 'spam',
        ])
        ->assertSessionHas([
            'toast:message' => trans('pages.reports.throttle', [
                'time' => trans_choice('common.n_hours', 23, ['count' => 23]),
            ]),
            'toast:type' => ToastType::Warning->value,
        ]);

    expect($secondCollection->reports()->count())->toBe(1);

    $report = $secondCollection->reports()->first();

    expect($report->user->is($user))->toBeTrue();
    expect($report->reason)->toBe('spam');

    expect(Report::where('user_id', $user->id)->count())->toBe(2);
});

it('should throttle 6 reports total per hour', function () {
    $user = createUser();

    $collections = Collection::factory(6)->create();
    $otherCollections = Collection::factory(4)->create();

    foreach ($collections as $collection) {
        $this->actingAs($user)
            ->post(route('collection-reports.create', $collection), [
                'reason' => 'spam',
            ])
            ->assertSessionHas([
                'toast:message' => trans('pages.reports.success'),
                'toast:type' => ToastType::Success->value,
            ]);
    }

    foreach ($otherCollections as $collection) {
        $this->actingAs($user)
            ->post(route('collection-reports.create', $collection), [
                'reason' => 'spam',
            ])
            ->assertSessionHas([
                'toast:message' => trans('pages.reports.throttle', [
                    'time' => trans_choice('common.n_minutes', 59, ['count' => 59]),
                ]),
                'toast:type' => ToastType::Warning->value,
            ]);
    }

    expect(Report::where('user_id', $user->id)->count())->toBe(6);
});
