<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\User;
use App\Models\Wallet;
use Filament\Panel;

it('can create a basic user', function () {
    $user = User::factory()->create();

    expect($user->username)->not()->toBeNull();
});

it('can assign a wallet to a user', function () {
    $user = User::factory()->create();
    $address = '0x1234567890123456789012345678901234567890';

    expect($user->wallets)->toHaveLength(0);

    $user->wallets()->create([
        'address' => $address,
        'total_usd' => 100,
    ]);

    $user->refresh();

    expect($user->wallets)->toHaveLength(1);
    expect($user->wallets->first()->address)->toBe($address);
});

it('can retrieve the main wallet of the user', function () {
    $user = User::factory()->create();
    $address = '0x1234567890123456789012345678901234567890';

    expect($user->wallets)->toHaveLength(0);

    $user->wallets()->create([
        'address' => '0x1231231231231231231231231231231231231231',
        'total_usd' => 100,
    ]);

    $wallet = $user->wallets()->create([
        'address' => $address,
        'total_usd' => 100,
    ]);

    $user->wallet()->associate($wallet);
    $user->save();
    $user->refresh();

    expect($user->wallets)->toHaveLength(2);
    expect($user->wallet->address)->toBe($wallet->address);
});

it('can softdelete a user', function () {
    $user = User::factory()->create();
    $username = $user->username;

    $this->assertDatabaseCount('users', 1);

    $this->assertDatabaseHas('users', [
        'username' => $username,
        'deleted_at' => null,
    ]);

    $user->delete();

    $this->assertDatabaseCount('users', 1);

    $this->assertDatabaseMissing('users', [
        'username' => $username,
        'deleted_at' => null,
    ]);
});

it('can restore a user', function () {
    $user = User::factory()->create();
    $username = $user->username;

    $this->assertDatabaseCount('users', 1);

    $this->assertDatabaseHas('users', [
        'username' => $username,
        'deleted_at' => null,
    ]);

    $user->delete();

    $this->assertDatabaseCount('users', 1);

    $this->assertDatabaseMissing('users', [
        'username' => $username,
        'deleted_at' => null,
    ]);

    $user->restore();

    $this->assertDatabaseCount('users', 1);

    $this->assertDatabaseHas('users', [
        'username' => $username,
        'deleted_at' => null,
    ]);
});

it('returns user currency', function () {
    $user = User::factory()->create();
    expect($user->currency())->toBe(CurrencyCode::USD);

    $user->extra_attributes->set([
        'currency' => 'eur',
    ]);

    $user->save();

    expect($user->currency())->toBe(CurrencyCode::EUR);
});

it('returns user currency lower case', function () {
    $user = User::factory()->create();

    $user->extra_attributes->set([
        'currency' => 'EUR',
    ]);
    $user->save();

    expect($user->currency())->toBe(CurrencyCode::EUR);
});

it('falls back to usd if user currency is not set', function () {
    $user = User::factory()->create();

    $user->extra_attributes->forget('currency');
    $user->save();

    expect($user->extra_attributes)->not()->toHaveKey('currency')
        ->and($user->currency())->toBe(CurrencyCode::USD);
});

it('can retrieve galleries assigned to the user', function () {
    $user = User::factory()->create();

    expect($user->galleries()->count())->toBe(0);

    Gallery::factory()->create([
        'user_id' => $user->id,
    ]);

    expect($user->galleries()->count())->toBe(1);
});

it('should get nfts from all wallets', function () {
    $user = User::factory()->create();
    $wallet1 = Wallet::factory()->create(['user_id' => $user->id]);
    $wallet2 = Wallet::factory()->create(['user_id' => $user->id]);

    expect($user->nfts()->count())->toBe(0);

    Nft::factory(10)->create(['wallet_id' => $wallet1->id]);
    Nft::factory(10)->create(['wallet_id' => $wallet2->id]);

    expect($user->nfts()->count())->toBe(20);
});

it('should get the collections for a user', function () {
    $user = createUser();

    $userCollection = Collection::factory()->create();

    Collection::factory()->count(2)->create();

    $userCollection2 = Collection::factory()->create();

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    // Fpr another wallet
    Nft::factory()->create([
        'collection_id' => $userCollection2->id,
    ]);

    expect($user->collections()->count())->toBe(2);

    expect($user->collections()->pluck('collections.id')->toArray())->toEqualCanonicalizing([
        $userCollection->id,
        $userCollection2->id,
    ]);
});

it('should calculate and get the collection value for users', function () {
    [$matic, , $weth] = seedTokens();

    $user = createUser();

    $user2 = createUser();

    $user3 = createUser();

    // 1 MATIC = 1.052 USD
    $userCollection = Collection::factory()->create([
        'floor_price' => 3.5 * 1e18,
        'floor_price_token_id' => $matic->id,
    ]);

    Collection::factory()->count(2)->create();

    // 1 ETH = 1769.02 USD
    $userCollection2 = Collection::factory()->create([
        'floor_price' => 2.1 * 1e18,
        'floor_price_token_id' => $weth->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    // For another user
    Nft::factory()->create([
        'wallet_id' => $user2->wallet_id,
        'collection_id' => $userCollection2->id,
    ]);

    // 5 items from the same collection for another user
    Nft::factory()->count(5)->create([
        'wallet_id' => $user3->wallet_id,
        'collection_id' => $userCollection->id,
    ]);

    // Value not updated yet
    expect($user->collectionsValue(CurrencyCode::USD))->toBeNull();

    User::updateCollectionsValue([$user->id]);

    expect(round($user->fresh()->collectionsValue(CurrencyCode::USD), 2))->toBe(
        round(3.5 * 1.052 + 2.1 * 1769.02, 2)
    );

    // Value not updated yet since I passed the user id
    expect($user2->fresh()->collectionsValue(CurrencyCode::USD))->toBeNull();

    User::updateCollectionsValue();

    // Same value for user 1
    expect(round($user->fresh()->collectionsValue(CurrencyCode::USD), 2))->toBe(
        round(3.5 * 1.052 + 2.1 * 1769.02, 2)
    );

    expect(round($user2->fresh()->collectionsValue(CurrencyCode::USD), 2))->toBe(
        round(2.1 * 1769.02, 2)
    );

    expect(round($user3->fresh()->collectionsValue(CurrencyCode::USD), 2))->toBe(
        round(3.5 * 1.052 * 5, 2)
    );
});

it('can get filament name', function () {
    $user = new User([
        //
    ]);

    expect($user->getFilamentName())->toBeString();
});

it('can get filament access', function () {
    $user = new User([
        //
    ]);

    expect($user->canAccessPanel(new Panel))->toBeFalse();

    // Always has access in local env...

    app()['env'] = 'local';

    expect($user->canAccessPanel(new Panel))->toBeTrue();
});
