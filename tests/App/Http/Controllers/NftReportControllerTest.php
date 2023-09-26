<?php

declare(strict_types=1);

use App\Enums\ToastType;
use App\Models\Nft;
use App\Models\Report;
use App\Support\Facades\Signature;

describe('user without a signed wallet', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')->andReturn(false);
    });

    it('cannot create a new report if wallet is not signed', function () {
        $user = createUser();
        $nft = Nft::factory()->create();

        expect($nft->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('nft-reports.create', $nft), [
            'reason' => 'spam',
        ])->assertRedirect();;

        expect($nft->reports()->count())->toBe(0);
    });
});

describe('user with a signed wallet', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->andReturn(true);
    });

    it('can create a new report', function () {
        $user = createUser();
        $nft = Nft::factory()->create();

        expect($nft->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('nft-reports.create', $nft), [
            'reason' => 'spam',
        ]);

        expect($nft->reports()->count())->toBe(1);

        $report = $nft->reports()->first();

        expect($report->user->is($user))->toBeTrue();
        expect($report->reason)->toBe('spam');
    });

    it('requires a reason', function () {
        $user = createUser();
        $nft = Nft::factory()->create();

        expect($nft->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('nft-reports.create', $nft), [
            'reason' => '',
        ])->assertSessionHasErrors('reason');

        expect($nft->reports()->count())->toBe(0);
    });

    it('requires a valid reason', function () {
        $user = createUser();
        $nft = Nft::factory()->create();

        expect($nft->reports()->count())->toBe(0);

        $this->actingAs($user)->post(route('nft-reports.create', $nft), [
            'reason' => 'invalid',
        ])->assertSessionHasErrors('reason');

        expect($nft->reports()->count())->toBe(0);
    });

    it('should throttle 1 report per day per nft', function () {
        $user = createUser();
        $nft = Nft::factory()->create();
        $secondNft = Nft::factory()->create();

        expect($nft->reports()->count())->toBe(0);

        $this->actingAs($user)
            ->post(route('nft-reports.create', $nft), [
                'reason' => 'spam',
            ]);

        $this->actingAs($user)
            ->post(route('nft-reports.create', $nft), [
                'reason' => 'spam',
            ])
            ->assertSessionHas([
                'toast:message' => trans('pages.reports.throttle', [
                    'time' => trans_choice('common.n_hours', 23, ['count' => 23]),
                ]),
                'toast:type' => ToastType::Warning->value,
            ]);

        expect($nft->reports()->count())->toBe(1);

        $report = $nft->reports()->first();

        expect($report->user->is($user))->toBeTrue();
        expect($report->reason)->toBe('spam');

        $this->actingAs($user)
            ->post(route('nft-reports.create', $secondNft), [
                'reason' => 'spam',
            ]);

        $this->actingAs($user)
            ->post(route('nft-reports.create', $secondNft), [
                'reason' => 'spam',
            ])
            ->assertSessionHas([
                'toast:message' => trans('pages.reports.throttle', [
                    'time' => trans_choice('common.n_hours', 23, ['count' => 23]),
                ]),
                'toast:type' => ToastType::Warning->value,
            ]);

        expect($secondNft->reports()->count())->toBe(1);

        $report = $secondNft->reports()->first();

        expect($report->user->is($user))->toBeTrue();
        expect($report->reason)->toBe('spam');

        expect(Report::where('user_id', $user->id)->count())->toBe(2);
    });

    it('should throttle 6 reports total per hour', function () {
        $user = createUser();

        $nfts = Nft::factory(6)->create();
        $otherNfts = Nft::factory(4)->create();

        foreach ($nfts as $nft) {
            $this->actingAs($user)
                ->post(route('nft-reports.create', $nft), [
                    'reason' => 'spam',
                ])
                ->assertSessionHas([
                    'toast:message' => trans('pages.reports.success'),
                    'toast:type' => ToastType::Success->value,
                ]);
        }

        foreach ($otherNfts as $nft) {
            $this->actingAs($user)
                ->post(route('nft-reports.create', $nft), [
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
