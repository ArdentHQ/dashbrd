<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Wallet>
 */
class WalletFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => fn () => User::factory(),
            'address' => '0x'.fake()->sha1(), // To imitate an address
            'total_usd' => fake()->randomFloat(2, 200, 500000),
            'onboarded_at' => now(),
            'is_refreshing_collections' => false,
            'last_signed_at' => random_int(0, 1) ? now() : null,
        ];
    }

    public function recentlyActive(): self
    {
        return $this->state([
            'last_activity_at' => fake()->dateTimeBetween('-'.config('dashbrd.wallets.active_threshold').' seconds', 'now'),
        ]);
    }

    public function recentlyActiveButNotOnline(): self
    {
        return $this->state([
            'last_activity_at' => fake()->dateTimeBetween('-'.config('dashbrd.wallets.active_threshold').' seconds', '-'.(config('dashbrd.wallets.online_threshold') + 1).' seconds'),
        ]);
    }

    public function online(): self
    {
        return $this->state([
            'last_activity_at' => fake()->dateTimeBetween('-'.config('dashbrd.wallets.online_threshold').' seconds', 'now'),
        ]);
    }

    public function inactive(): self
    {
        return $this->state([
            'last_activity_at' => fake()->optional()->dateTimeBetween('-1 month', '-'.(config('dashbrd.wallets.active_threshold') + 1).' seconds'),
        ]);
    }

    public function withUser(User $user): self
    {
        return $this->state([
            'user_id' => $user->id,
        ]);
    }
}
