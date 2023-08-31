<?php

declare(strict_types=1);

use App\Models\Collection;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\CollectionReport;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();

    config([
        'dashbrd.reports.enabled' => true,
    ]);
});

it('can generate a slack notification', function () {
    $user = User::factory()->create();
    $reportedUser = User::factory()->create();

    $collection = Collection::factory()->create();

    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'address' => 'user-reporter',
    ]);

    $user->update([
        'wallet_id' => $wallet->id,
    ]);

    $wallet = Wallet::factory()->create([
        'user_id' => $reportedUser->id,
        'address' => 'user-reported',
    ]);

    $reportedUser->update([
        'wallet_id' => $wallet->id,
    ]);

    $collection->reports()->create([
        'user_id' => $user->id,
        'reason' => 'spam',
    ]);

    Notification::assertSentTo(
        new AnonymousNotifiable(),
        function (CollectionReport $notification) use ($user, $collection) {
            $slackMessage = $notification->toSlack(new AnonymousNotifiable())->attachments[0];

            expect($notification->report->reason)->toBe('spam');
            expect($notification->report->user_id)->toBe($user->id);
            expect($notification->report->subject_type)->toBe(Collection::class);
            expect($notification->report->subject_id)->toBe($collection->id);

            expect($slackMessage->authorName)->toBe('Reporter: '.$user->wallet->address);

            return true;
        }
    );
});

it('can generate a slack notification without user having an active wallet', function () {
    $user = User::factory()->create();
    $reportedUser = User::factory()->create();

    $collection = Collection::factory()->create();

    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'address' => 'user-reporter',
    ]);

    $wallet = Wallet::factory()->create([
        'user_id' => $reportedUser->id,
        'address' => 'user-reported',
    ]);

    $reportedUser->update([
        'wallet_id' => $wallet->id,
    ]);

    $collection->reports()->create([
        'user_id' => $user->id,
        'reason' => 'spam',
    ]);

    Notification::assertSentTo(
        new AnonymousNotifiable(),
        function (CollectionReport $notification) use ($user, $collection) {
            $slackMessage = $notification->toSlack(new AnonymousNotifiable())->attachments[0];

            expect($notification->report->reason)->toBe('spam');
            expect($notification->report->user_id)->toBe($user->id);
            expect($notification->report->subject_type)->toBe(Collection::class);
            expect($notification->report->subject_id)->toBe($collection->id);

            expect($slackMessage->authorName)->toBe('Reporter: Unknown address');

            return true;
        }
    );
});
