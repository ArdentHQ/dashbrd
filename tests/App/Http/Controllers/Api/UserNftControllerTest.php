<?php

declare(strict_types=1);

use App\Models\Nft;
use App\Models\User;
use App\Models\Wallet;

it('returns user nfts in order', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create(['user_id' => $user->id]);

    $nfts = Nft::factory(3)->create(['wallet_id' => $wallet->id]);

    expect($user->nfts()->count())->toBe(3);

    $ids = [$nfts[1]->id, $nfts[2]->id, $nfts[0]->id];

    $this->actingAs($user)
        ->get(route('user.nfts', [
            'ids' => implode(',', $ids),
        ]))
        ->assertOk()
        ->assertJson([
            [
                'id' => $ids[0],
            ],
            [
                'id' => $ids[1],
            ],
            [
                'id' => $ids[2],
            ],
        ]);
});

it('filters nfts the user does not owns', function () {
    Nft::truncate();

    $user = User::factory()->create();

    $wallet = Wallet::factory()->create(['user_id' => $user->id]);

    $nfts = Nft::factory(3)->create(['wallet_id' => $wallet->id]);

    expect($user->nfts()->count())->toBe(3);

    $ids = [$nfts[1]->id, $nfts[2]->id, 999];

    $this->actingAs($user)
        ->get(route('user.nfts', [
            'ids' => implode(',', $ids),
        ]))
        ->assertOk()
        ->assertJsonCount(2);
});
