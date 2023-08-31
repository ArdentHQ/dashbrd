<?php

declare(strict_types=1);

use App\Jobs\FetchEnsDetails;
use App\Models\Wallet;
use App\Support\Facades\Moralis;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;

it('should fetch ens domain and the avatar', function () {
    Bus::fake();

    Http::fake([
        'https://metadata.ens.domains/mainnet/avatar/something.eth' => Http::response(
            UploadedFile::fake()->image('avatar.png')->get(),
            200,
            [
                'Content-Type' => 'image/png',
            ]
        ),
    ]);

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.ens_resolve'), 200),
    ]);

    $wallet = Wallet::factory()->create();

    (new FetchEnsDetails($wallet))->handle();

    expect($wallet->fresh()->details->domain)->toBe('something.eth');

    expect($wallet->fresh()->details->media()->exists())->toBeTrue();
});

it('should not store the same avatar twice', function () {
    Bus::fake();

    Http::fake([
        'https://metadata.ens.domains/mainnet/avatar/something.eth' => Http::response(
            UploadedFile::fake()->image('avatar.png')->get(),
            200,
            [
                'Content-Type' => 'image/png',
            ]
        ),
    ]);

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.ens_resolve'), 200),
    ]);

    $wallet = Wallet::factory()->create();

    (new FetchEnsDetails($wallet))->handle();

    expect($wallet->fresh()->details->domain)->toBe('something.eth');

    $media = $wallet->fresh()->details->getFirstMedia('avatar');

    expect($media)->not->toBeNull();

    $createdAt = $media->created_at;

    // set date to one minute later
    $this->travel(1)->minutes();

    (new FetchEnsDetails($wallet->fresh()))->handle();

    $media = $wallet->fresh()->details->getFirstMedia('avatar');

    expect($media->created_at->timestamp)->toBe($createdAt->timestamp);
});

it('should remove the avatar if no longer exist', function () {
    Bus::fake();

    Http::fake([
        'https://metadata.ens.domains/mainnet/avatar/something.eth' => Http::response(
            '',
            404
        ),
    ]);

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.ens_resolve'), 200),
    ]);

    $wallet = Wallet::factory()->create();

    $walletDetails = $wallet->details()->updateOrCreate([
        'domain' => 'something.eth',
    ]);

    $walletDetails->addMedia(UploadedFile::fake()->image('avatar.png'))->toMediaCollection('avatar');

    expect($walletDetails->media()->exists())->toBeTrue();

    (new FetchEnsDetails($wallet))->handle();

    expect($walletDetails->media()->exists())->toBeFalse();
});

it('should update the avatar if is a new one', function () {
    Bus::fake();

    // First time one image, second time another image
    Http::fake([
        'https://metadata.ens.domains/mainnet/avatar/something.eth' => Http::sequence()
            ->push(
                UploadedFile::fake()->image('avatar.png')->get(),
                200,
                [
                    'Content-Type' => 'image/png',
                ]
            )
            ->push(
                UploadedFile::fake()->image('avatar2.png', 15, 15)->get(),
                200,
                [
                    'Content-Type' => 'image/png',
                ]
            ),
    ]);

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.ens_resolve'), 200),
    ]);

    $wallet = Wallet::factory()->create();

    (new FetchEnsDetails($wallet))->handle();

    expect($wallet->fresh()->details->domain)->toBe('something.eth');

    $media = $wallet->fresh()->details->getFirstMedia('avatar');

    expect($media)->not->toBeNull();

    $createdAt = $media->created_at;

    // set date to one minute later
    $this->travel(1)->minutes();

    (new FetchEnsDetails($wallet->fresh()))->handle();

    $media = $wallet->fresh()->details->getFirstMedia('avatar');

    expect($media->created_at->timestamp)->not->toBe($createdAt->timestamp);
});

it('should handle unexisting avatar', function () {
    Bus::fake();

    Http::fake([
        'https://metadata.ens.domains/mainnet/avatar/something.eth' => Http::response(
            '',
            404
        ),
    ]);

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response(fixtureData('moralis.ens_resolve'), 200),
    ]);

    $wallet = Wallet::factory()->create();

    (new FetchEnsDetails($wallet))->handle();

    expect($wallet->fresh()->details->media()->exists())->toBeFalse();
});

it('should not fetch the avatar if no domain is found', function () {
    Bus::fake();

    Moralis::fake([
        'https://deep-index.moralis.io/api/v2/*' => Http::response('', 404),
    ]);

    $wallet = Wallet::factory()->create();

    (new FetchEnsDetails($wallet))->handle();

    expect($wallet->fresh()->details->domain)->toBeNull();

    expect($wallet->fresh()->details->media()->exists())->toBeFalse();
});

it('should use the wallet id as a unique job identifier', function () {
    Bus::fake();

    $wallet = Wallet::factory()->create();

    expect((new FetchEnsDetails($wallet)))->uniqueId()->toBeString();
});

it('has a retry until', function () {
    $wallet = Wallet::factory()->create();

    $job = new FetchEnsDetails($wallet);

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});
