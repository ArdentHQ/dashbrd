<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CoingeckoToken;
use App\Models\Network;
use App\Models\Token;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TokenGuid>
 */
class TokenGuidFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'guid' => fake()->unique()->word(),
            'address' => '0x'.fake()->sha1(), // To imitate an address
            'network_id' => fn () => Network::factory(),
        ];
    }

    public function inferred(): self
    {
        return $this->state(fn () => [
            'guid' => function ($params) {
                $address = Arr::get($params, 'address');
                $networkId = Arr::get($params, 'network_id');

                if (! is_null($address) && ! is_null($networkId)) {
                    $token = Token::where('address', $address)->where('network_id', $networkId)
                        ->firstOrFail();

                    $coingeckoToken = CoingeckoToken::lookupByToken($token);

                    return $coingeckoToken['coingecko_id'];
                }

                return fake()->unique()->word();
            },
        ]);
    }
}
