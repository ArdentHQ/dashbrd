<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Token;
use App\Models\TokenGuid;
use App\Models\TokenPrice;
use App\Support\Currency;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TokenSeeder extends Seeder
{
    public function run(): void
    {
        $allCurrencies = Currency::all();
        $count = count($allCurrencies);

        $mainTokens = $this->tokens();

        foreach ($mainTokens as [$address, $networkId, $name, $symbol, $decimals]) {
            $token = Token::factory()->create([
                'address' => $address,
                'network_id' => $networkId,
                'is_native_token' => $symbol === 'MATIC' || $symbol == 'ETH',
                'is_default_token' => $symbol === 'MATIC' || $symbol == 'ETH',
                'name' => $name,
                'symbol' => $symbol,
                'decimals' => $decimals,
                'extra_attributes' => $symbol === 'DARK' ? null : json_decode(file_get_contents(database_path('seeders/fixtures/coingecko/'.strtolower($symbol === 'ETH' ? 'WETH' : $symbol).'.json'))),
            ]);

            $guid = TokenGuid::factory()
                ->inferred()
                ->create(['address' => $address, 'network_id' => $networkId]);

            $token->tokenGuid()->associate($guid);
            $token->save();

            $token->tokenPrices()->saveMany(
                TokenPrice::factory($count)
                    ->sequence(fn (Sequence $sequence) => ['token_guid' => $guid, 'currency' => Str::lower($allCurrencies[$sequence->index % $count]->code)])->create(),
            );
        }

        $fs = Storage::disk('live-dump');

        $restOfTokens = $fs->exists('tokens.json')
            ? collect(json_decode($fs->get('tokens.json'), true))
            : collect();

        $restOfTokens = $restOfTokens
            // Prevent overriding main tokens data
            ->filter(fn ($tokenData) => $mainTokens->doesntContain(fn ($mainTokenData) => $mainTokenData[0] === $tokenData['address'] && $mainTokenData[1] === $tokenData['network_id']))
            ->chunk(100)
            ->each(function ($chunk) {
                $data = $chunk->map(function ($tokenData) {
                    $guid = TokenGuid::firstOrCreate([
                        'address' => $tokenData['address'],
                        'network_id' => $tokenData['network_id'],
                        'guid' => $tokenData['guid'],

                    ])->id;

                    unset($tokenData['guid']);

                    return [
                        ...$tokenData,
                        'symbol' => Str::upper($tokenData['symbol']),
                        'decimals' => $tokenData['decimals'] ?? 0,
                        'extra_attributes' => json_encode($tokenData['extra_attributes']),
                        'token_guid' => $guid,
                    ];
                })->toArray();

                Token::upsert($data, ['address', 'network_id'], ['extra_attributes', 'name', 'symbol', 'decimals', 'token_guid']);
            });
    }

    private function tokens(): Collection
    {
        // [address, network_id, name, symbol, decimals]
        return collect([
            ['0x0000000000000000000000000000000000001010', 1, 'Polygon', 'MATIC', 18],
            ['0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 1, 'USD Coin', 'USDC', 6],
            ['0x3ba4c387f786bfee076a58914f5bd38d668b42c3', 1, 'BNB', 'BNB', 18],
            ['0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39', 1, 'Chainlink', 'LINK', 18],
            ['0x61299774020da444af134c82fa83e3810b309991', 1, 'Render', 'RNDR', 18],
            ['0x3cef98bb43d732e2f285ee605a8158cde967d219', 1, 'Basic Attention', 'BAT', 18],
            ['0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c', 1, 'Compound', 'COMP', 18],
            ['0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3', 1, 'Balancer', 'BAL', 18],
            ['0xbbba073c31bf03b8acf7c28ef0738decf3695683', 1, 'The Sandbox', 'SAND', 18],
            ['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 1, 'Wrapped Ether', 'WETH', 18],
            ['0x0000000000000000000000000000000000001010', 2, 'Polygon', 'MATIC', 18],
            ['0x0000000000000000000000000000000000000000', 3, 'Ethereum', 'ETH', 18],
            ['0x0000000000000000000000000000000000000000', 4, 'Ethereum', 'ETH', 18],
        ]);
    }
}
