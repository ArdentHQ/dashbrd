<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Network;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::withoutEvents(fn () => User::factory()->create([
            'username' => 'john.doe',
        ]));

        $wallet = Wallet::withoutEvents(fn () => Wallet::factory()->create([
            'user_id' => $user->id,
            'address' => env('LOCAL_TESTING_ADDRESS'),
        ]));

        $user->update([
            'wallet_id' => $wallet->id,
        ]);
    }

    /**
     * @return Collection<int, Network>
     */
    protected function mainnets(): Collection
    {
        return Network::where('is_mainnet', true)->orderBy('id', 'asc')->get();
    }
}
