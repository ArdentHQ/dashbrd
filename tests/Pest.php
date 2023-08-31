<?php

declare(strict_types=1);

use App\Models\Network;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Pennant\Feature;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "uses()" function to bind a different classes or traits.
|
*/

uses(TestCase::class, RefreshDatabase::class)->in('Analysis');

uses(TestCase::class, RefreshDatabase::class)->in('App');

uses()->beforeEach(function () {
    Feature::purge();

    Token::factory()->matic()->create();
})->in('App/Http/Controllers');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

//

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function createUser(array $attributes = [], array $walletAttributes = [])
{
    $network = Network::factory()->create();

    $user = User::factory()->create($attributes);

    $wallet = Wallet::factory()->create(array_merge([
        'user_id' => $user->id,
    ], $walletAttributes));

    return tap($user)->update([
        'wallet_id' => $wallet->id,
    ]);
}

/**
 * Read the contents of a fixture file.
 *
 * Pass the path using dot notation, e.g. "coingecko.coins_bitcoin".
 *
 * @return array<mixed>
 */
function fixtureData(string $name): array
{
    $path = str_replace('.', '/', $name);

    return json_decode(file_get_contents(base_path("tests/fixtures/{$path}.json")), true);
}

function addViews(Model $model, int $count = 1)
{
    $views = collect(range(1, $count))->map(fn () => [
        'viewable_id' => $model->getKey(),
        'viewable_type' => $model->getMorphClass(),
        'visitor' => uniqid(),
        'viewed_at' => fake()->dateTimeBetween('-1 year', 'now'),
    ])->toArray();

    DB::table('views')->insert($views);
}

function seedTokens()
{
    $tokens = [
        ['0x0000000000000000000000000000000000001010', 'Matic', 'MATIC', 18],
        ['0xbbba073c31bf03b8acf7c28ef0738decf3695683', 'The Sandbox', 'SAND', 18],
        ['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 'Wrapped Ether', 'WETH', 18],
    ];

    $dbTokens = collect();
    foreach ($tokens as [$address, $name, $symbol, $decimals]) {
        $token = Token::factory()->onPolygonNetwork()->create([
            'address' => $address,
            'name' => $name,
            'symbol' => $symbol,
            'decimals' => $decimals,
            'extra_attributes' => json_decode(file_get_contents(database_path('seeders/fixtures/coingecko/'.strtolower($symbol).'.json')), true),
        ]);

        $dbTokens = $dbTokens->push($token);
    }

    return $dbTokens;
}
