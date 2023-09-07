<?php

declare(strict_types=1);

use App\Models\Balance;
use App\Models\CoingeckoToken;
use App\Models\Network;
use App\Models\SpamToken;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use App\Support\Facades\Coingecko;
use Illuminate\Support\Facades\Config;

it('should list tokens for authenticated users', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);
    $user->save();

    $this->actingAs($user)
        ->get(route('tokens.list'))
        ->assertOk();
});

it('should not allow access to non authenticated users', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);
    $user->save();

    $this->get(route('tokens.list'))
        ->assertRedirect(route('galleries'));
});

it('should return user portfolio breakdown', function () {
    $wallet = Wallet::factory()->create();

    $user = User::factory()->create([
        'wallet_id' => $wallet->id,
    ]);

    $network = Network::factory(['is_mainnet' => true])->create();

    Token::factory(10)
        ->afterCreating(function (Token $token) use ($wallet) {
            Balance::factory()->create([
                'token_id' => $token->id,
                'wallet_id' => $wallet->id,
            ]);
        })
        ->create([
            'network_id' => $network->id,
            // adding matic prices to all tokens so we can have fiat values
            'extra_attributes' => json_decode(file_get_contents(database_path('seeders/fixtures/coingecko/matic.json')), true),
        ]);

    $data = $this->actingAs($user)
        ->get(route('tokens.breakdown', [
            'top_count' => 6,
        ]))
        ->assertOk()
        ->json();

    expect($data)->toHaveCount(7);

    expect(array_keys($data[0]))->toEqual([
        'name',
        'symbol',
        'balance',
        'decimals',
        'fiat_balance',
        'percentage',
    ]);

    expect($data[6]['symbol'])->toBe('Other');
    expect(explode(', ', $data[6]['name']))->toHaveLength(4);
    expect($data[6]['balance'])->toBeNull();
});

it('should return matic as fallback for portfolio breakdown', function () {
    $wallet = Wallet::factory()->create();

    $user = User::factory()->create([
        'wallet_id' => $wallet->id,
    ]);

    $data = $this->actingAs($user)
        ->get(route('tokens.breakdown', [
            'top_count' => 6,
        ]))
        ->assertOk()
        ->json();

    expect($data)->toHaveCount(1);

    expect($data[0])->toEqual([
        'name' => 'Polygon',
        'symbol' => 'MATIC',
        'balance' => '0',
        'decimals' => '18',
        'fiat_balance' => '0',
        'percentage' => '0',
    ]);
});

it('should not list spam tokens but matic as fallback', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet_id = $wallet->id;
    $user->save();

    $network = Network::factory(['is_mainnet' => true])->create();
    $token = Token::factory()->create(['name' => 'Ethereum', 'symbol' => 'ETH', 'network_id' => $network->id]);
    $token2 = Token::factory()->create(['name' => 'Balancer', 'symbol' => 'BAL', 'network_id' => $network->id]);

    // Add tokens to coingecko so they won't be marked as spam
    CoingeckoToken::factory()->create([
        'name' => 'Ethereum',
        'symbol' => 'ETH',
    ]);

    CoingeckoToken::factory()->create([
        'name' => 'Balancer',
        'symbol' => 'BAL',
    ]);

    Balance::factory()->createMany([
        ['token_id' => $token->id, 'wallet_id' => $wallet->id],
        ['token_id' => $token2->id, 'wallet_id' => $wallet->id],
    ]);

    $response = $this->actingAs($user)
        ->get(route('tokens.list'))
        ->assertOk();

    expect($response->json('data'))->toHaveLength(2);

    SpamToken::factory()->create([
        'token_id' => $token2->id,
    ]);

    $spamToken = $token2;

    $response = $this->actingAs($user)
        ->get(route('tokens.list'))
        ->assertOk();

    expect($response->json('data'))->toHaveLength(1);

    expect($response->json('data.0.address'))->toBe($token->address);

    SpamToken::factory()->create([
        'token_id' => $token->id,
    ]);

    $response = $this->actingAs($user)
        ->get(route('tokens.list'))
        ->assertOk();

    expect($response->json('data'))->toHaveLength(1);
    expect($response->json('data.0.symbol'))->toBe('MATIC');
});

function setupSearchTokens(): User
{
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create();

    $user->wallet()->associate($wallet);
    $user->save();

    $network = Network::factory()->create([
        'is_mainnet' => true,
    ]);

    $token = Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'LINK',
        'name' => 'Chainlink',
    ]);

    $token2 = Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'BAL',
        'name' => 'Chainbal',
    ]);

    $token3 = Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'DAN',
        'name' => 'Dozen',
    ]);

    $token4 = Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'MBA',
        'name' => 'MBA Token',
    ]);

    SpamToken::factory()->create([
        'token_id' => $token4->id,
    ]);

    Balance::factory()->createMany([
        ['token_id' => $token->id, 'wallet_id' => $wallet->id, 'balance' => 145],
        ['token_id' => $token2->id, 'wallet_id' => $wallet->id, 'balance' => 45],
        ['token_id' => $token3->id, 'wallet_id' => $wallet->id, 'balance' => 0],
        ['token_id' => $token4->id, 'wallet_id' => $wallet->id, 'balance' => 10],
    ]);

    return $user;
}

it('should search tokens with their symbols', function () {
    $user = setupSearchTokens();

    $response = $this->actingAs($user)
        ->get(route('tokens.search', ['query' => 'link']))
        ->assertOk();

    $tokens = collect($response->json());

    expect($tokens->count())->toEqual(1)
        ->and($tokens->first()['name'])->toEqual('Chainlink');
});

it('should search tokens with their names', function () {

    $user = setupSearchTokens();

    $response = $this->actingAs($user)
        ->get(route('tokens.search', ['query' => 'chain']))
        ->assertOk();

    $tokens = collect($response->json());

    expect($tokens->count())->toEqual(2);
});

it('should sort searched tokens by their balance', function () {
    $user = setupSearchTokens();

    $response = $this->actingAs($user)
        ->get(route('tokens.search', ['query' => 'chain']))
        ->assertOk();

    $tokens = collect($response->json());

    expect($tokens->first()['name'])->toEqual('Chainlink');
});

it('should exclude tokens with 0 balance while searching', function () {
    $user = setupSearchTokens();

    $response = $this->actingAs($user)
        ->get(route('tokens.search', ['query' => 'dan']))
        ->assertOk();

    $tokens = collect($response->json());

    expect($tokens->count())->toEqual(0);
});

it('should exclude spam tokens while searching', function () {
    $user = setupSearchTokens();

    $response = $this->actingAs($user)
        ->get(route('tokens.search', ['query' => 'mba']))
        ->assertOk();

    $tokens = collect($response->json());

    expect($tokens->count())->toEqual(0);
});

it('should exclude testnet tokens if `testnet_enabled` flag disabled', function () {
    Config::set('dashbrd.testnet_enabled', false);

    $network = Network::factory()->create([
        'is_mainnet' => false,
    ]);

    $token = Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'LINDA',
        'name' => 'Linda',
    ]);

    $user = setupSearchTokens();

    $wallet = $user->wallet()->first();

    Balance::factory()->createMany([
        ['token_id' => $token->id, 'wallet_id' => $wallet->id, 'balance' => 5],
    ]);

    $response = $this->actingAs($user)
        ->get(route('tokens.search', ['query' => 'li']))
        ->assertOk();

    $tokens = collect($response->json());

    expect($tokens->count())->toEqual(1);
});
