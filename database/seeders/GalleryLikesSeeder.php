<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Gallery;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;

class GalleryLikesSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::withoutEvents(fn () => User::factory()->create());

        $wallet = Wallet::withoutEvents(fn () => Wallet::factory()->create([
            'user_id' => $user->id,
        ]));

        $user->update([
            'wallet_id' => $wallet->id,
        ]);

        Gallery::each(function ($gallery) use ($user) {
            $gallery->addLike($user);
        });

        Gallery::updateScores();
    }
}
