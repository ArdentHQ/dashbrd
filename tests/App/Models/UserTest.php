<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Enums\Role;
use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\Permission;
use App\Models\Role as RoleModel;
use App\Models\User;
use App\Models\Wallet;
use Filament\Panel;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\PermissionRegistrar;

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

it('handles missing filament access permission', function () {
    $user = User::factory()->editor()->create();

    expect($user->canAccessPanel(new Panel))->toBeTrue();

    Permission::where('name', 'admin:access')->delete();

    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    expect($user->canAccessPanel(new Panel))->toBeFalse();
});

it('filters managers', function () {
    $user = User::factory()->create();
    $superadmin = User::factory()->create();
    $admin = User::factory()->create();
    $editor = User::factory()->create();

    $editor->assignRole([
        RoleModel::where('name', Role::Editor->value)->where('guard_name', 'admin')->firstOrFail(),
    ])->save();

    $admin->assignRole([
        RoleModel::where('name', Role::Admin->value)->where('guard_name', 'admin')->firstOrFail(),
    ])->save();

    $superadmin->assignRole([
        RoleModel::where('name', Role::Superadmin->value)->where('guard_name', 'admin')->firstOrFail(),
    ])->save();

    $managers = User::managers()->get();

    expect($managers)->toHaveCount(3);

    expect($managers->pluck('id')->toArray())->toEqualCanonicalizing([
        $superadmin->id,
        $admin->id,
        $editor->id,
    ]);
});

it('has avatar', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('avatar.png');

    $user->addMedia($file)->toMediaCollection('avatar');

    expect($user->getFirstMediaUrl('avatar'))->toBeString();
});
