<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\Chain;
use App\Models\Network;
use App\Models\TokenGuid;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Token>
 */
class TokenFactory extends Factory
{
    protected function getDefaultExtraAttributes(array $override = []): array
    {
        return array_replace_recursive(
            [
                'market_cap' => fake()->numberBetween(0, 20000000),
                'volume' => fake()->numberBetween(0, 20000000),
                'market_data' => [
                    'market_cap' => [
                        'eur' => fake()->numberBetween(0, 20000000),
                        'usd' => fake()->numberBetween(0, 20000000),
                    ],
                    'total_volume' => [
                        'eur' => fake()->numberBetween(0, 20000000),
                        'usd' => fake()->numberBetween(0, 20000000),
                    ],
                    'ath' => [
                        'eur' => fake()->numberBetween(0, 50),
                        'usd' => fake()->numberBetween(0, 100),
                    ],
                    'atl' => [
                        'eur' => fake()->numberBetween(0, 10),
                        'usd' => fake()->numberBetween(0, 20),
                    ],
                    'current_price' => [
                        'eur' => fake()->numberBetween(0, 40),
                        'usd' => fake()->numberBetween(0, 50),
                    ],
                ],
            ],
            $override
        );
    }

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        return [
            'address' => '0x'.fake()->sha1(), // To imitate an address
            'network_id' => fn () => Network::factory(),
            'is_native_token' => fake()->boolean(),
            'is_default_token' => fake()->boolean(),
            'name' => fake()->name,
            'symbol' => fake()->currencyCode(),
            'decimals' => fake()->numberBetween(8, 18),
            'extra_attributes' => json_encode($this->getDefaultExtraAttributes()),
        ];
    }

    public function isDefault(): self
    {
        return $this->state(fn () => [
            'is_default_token' => true,
        ]);
    }

    public function onPolygonNetwork(): self
    {
        return $this->state(fn () => [
            'network_id' => function () {
                $network = Network::where('chain_id', Chain::Polygon->value)->first();

                if ($network !== null) {
                    return $network;
                }

                return Network::factory()->create([
                    'chain_id' => Chain::Polygon->value,
                    'name' => 'Polygon Mainnet',
                ]);
            },
        ]);
    }

    public function withMarketCap(int $marketCap): self
    {
        return $this->state(fn () => [
            'extra_attributes' => json_encode($this->getDefaultExtraAttributes([
                'market_data' => [
                    'market_cap' => [
                        'usd' => $marketCap,
                    ],
                ],
            ])),
        ]);
    }

    public function matic(): self
    {
        return $this->state(fn () => [
            'symbol' => 'MATIC',
            'name' => 'Polygon',
            'decimals' => 18,
            'extra_attributes' => json_encode([
                'market_cap' => 0,
            ]),
        ])->onPolygonNetwork();
    }

    public function maticWithPrices(): self
    {
        return $this
            ->matic()
            ->state(fn () => [
                'extra_attributes' => json_decode(file_get_contents(database_path('seeders/fixtures/coingecko/matic.json')), true),
            ]);
    }

    public function weth(): self
    {
        return $this->state(fn () => [
            'symbol' => 'WETH',
            'name' => 'Wrapped Ether',
            'decimals' => 18,
        ])
            ->onPolygonNetwork();
    }

    public function wethWithPrices(): self
    {
        return $this
            ->weth()
            ->state(fn () => [
                'extra_attributes' => json_decode(file_get_contents(database_path('seeders/fixtures/coingecko/weth.json')), true),
            ]);
    }

    public function withGuid(string $deterministicGuid = null): self
    {
        return $this->state(fn () => [
            'token_guid' => function ($params) use ($deterministicGuid) {
                $optional = $deterministicGuid ? ['guid' => $deterministicGuid] : [];

                return TokenGuid::factory()
                    ->create(array_merge([
                        'network_id' => $params['network_id'],
                        'address' => $params['address'],
                    ], $optional));
            },
        ]);
    }
}
