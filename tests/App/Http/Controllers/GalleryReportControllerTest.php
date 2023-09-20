<?php

declare(strict_types=1);

use App\Enums\ToastType;
use App\Models\Gallery;
use App\Models\Report;
use App\Support\Facades\Signature;

describe('user is signed', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')->andReturn(true);
    });

    it('can create a new report', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        expect($gallery->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('reports.create', $gallery), [
            'reason' => 'spam',
        ]);

        expect($gallery->reports()->count())->toBe(1);

        $report = $gallery->reports()->first();

        expect($report->user->is($user))->toBeTrue();
        expect($report->reason)->toBe('spam');
    });

    it('requires a reason', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        expect($gallery->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('reports.create', $gallery), [
            'reason' => '',
        ])->assertSessionHasErrors('reason');

        expect($gallery->reports()->count())->toBe(0);
    });

    it('requires a valid reason', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();

        expect($gallery->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('reports.create', $gallery), [
            'reason' => 'invalid',
        ])->assertSessionHasErrors('reason');

        expect($gallery->reports()->count())->toBe(0);
    });

    test('users cannot report their own galleries', function () {
        $user = createUser();

        $gallery = Gallery::factory()->create([
            'user_id' => $user->id,
        ]);

        expect($gallery->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('reports.create', $gallery), [
            'reason' => 'spam',
        ])->assertForbidden();

        expect($gallery->reports()->count())->toBe(0);
    });

    it('should throttle 1 report per day per gallery', function () {
        $user = createUser();
        $gallery = Gallery::factory()->create();
        $secondGallery = Gallery::factory()->create();

        expect($gallery->reports()->count())->toBe(0);

        $this->actingAs($user)
            ->post(route('reports.create', $gallery), [
                'reason' => 'spam',
            ]);

        $this->actingAs($user)
            ->post(route('reports.create', $gallery), [
                'reason' => 'spam',
            ])
            ->assertSessionHas([
                'toast:message' => trans('pages.reports.throttle', [
                    'time' => trans_choice('common.n_hours', 23, ['count' => 23]),
                ]),
                'toast:type' => ToastType::Warning->value,
            ]);

        expect($gallery->reports()->count())->toBe(1);

        $report = $gallery->reports()->first();

        expect($report->user->is($user))->toBeTrue();
        expect($report->reason)->toBe('spam');

        $this->actingAs($user)
            ->post(route('reports.create', $secondGallery), [
                'reason' => 'spam',
            ]);

        $this->actingAs($user)
            ->post(route('reports.create', $secondGallery), [
                'reason' => 'spam',
            ])
            ->assertSessionHas([
                'toast:message' => trans('pages.reports.throttle', [
                    'time' => trans_choice('common.n_hours', 23, ['count' => 23]),
                ]),
                'toast:type' => ToastType::Warning->value,
            ]);

        expect($secondGallery->reports()->count())->toBe(1);

        $report = $secondGallery->reports()->first();

        expect($report->user->is($user))->toBeTrue();
        expect($report->reason)->toBe('spam');

        expect(Report::where('user_id', $user->id)->count())->toBe(2);
    });

    it('should throttle 6 reports total per hour', function () {
        $user = createUser();

        $galleries = Gallery::factory(6)->create();
        $otherGalleries = Gallery::factory(4)->create();

        foreach ($galleries as $gallery) {
            $this->actingAs($user)
                ->post(route('reports.create', $gallery), [
                    'reason' => 'spam',
                ])
                ->assertSessionHas([
                    'toast:message' => trans('pages.reports.success'),
                    'toast:type' => ToastType::Success->value,
                ]);
        }

        foreach ($otherGalleries as $gallery) {
            $this->actingAs($user)
                ->post(route('reports.create', $gallery), [
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

});

describe('user not signed', function () {

    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')->andReturn(false);
    });

    it('cant create a new report if wallet is not signed', function () {

        $user = createUser();
        $gallery = Gallery::factory()->create();

        expect($gallery->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('reports.create', $gallery), [
            'reason' => 'spam',
        ])->assertRedirect();

        expect($gallery->reports()->count())->toBe(0);
    });
});
