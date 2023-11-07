<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Nft;
use App\Models\Token;
use App\Models\User;
use App\Support\Cache\GalleryCache;
use App\Support\Cache\UserCache;
use App\Support\Facades\Signature;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    Token::factory()->wethWithPrices()->create();
});

it('can render the "my galleries" page', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get(route('my-galleries'))
        ->assertStatus(200);
});

it('should include nft count when rendering the "my galleries" page', function () {
    $user = createUser();

    expect($user->nfts()->count())->toBe(0);

    Nft::factory(10)->create(['wallet_id' => $user->wallet->id]);

    $this->actingAs($user->fresh())
        ->get(route('my-galleries'))
        ->assertStatus(200)
        ->assertInertia(fn (AssertableInertia $page) => $page->where('nftCount', 10));
});

describe('user is signed', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->andReturn(true);
    });

    it('can render the "create" page', function () {
        $user = createUser();

        Nft::factory()->create(['wallet_id' => $user->wallet->id]);

        $this->actingAs($user)
            ->get(route('my-galleries.create'))
            ->assertStatus(200);
    });

    it('can render the "edit" page if owns the gallery', function () {
        $user = createUser();

        $gallery = Gallery::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->actingAs($user)
            ->get(route('my-galleries.edit', $gallery))
            ->assertStatus(200);
    });

    it('cannot open the "edit" page if does not owns the gallery', function () {
        $user = createUser();

        $gallery = Gallery::factory()->create();

        $this->actingAs($user)
            ->get(route('my-galleries.edit', $gallery))
            ->assertForbidden();
    });

    it('can delete a gallery the user owns', function () {
        $user = createUser();

        $gallery = Gallery::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->actingAs($user)
            ->delete(route('my-galleries.destroy', ['gallery' => $gallery]))
            ->assertRedirect(route('my-galleries'));

        expect($gallery->fresh())->toBeNull();
    });

    it('cant delete a gallery the user does not owns', function () {
        $user = createUser();

        $gallery = Gallery::factory()->create([
            'user_id' => User::factory()->create()->id,
        ]);

        $this->actingAs($user)
            ->delete(route('my-galleries.destroy', ['gallery' => $gallery]))
            ->assertForbidden();
    });

    it('can create a new gallery by posting required data', function () {
        $user = createUser();
        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'nfts' => [$nft->id],
                'coverImage' => null,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $user->refresh()->galleries()->where('name', 'Test')->first()));
    });

    it('calculates the value of a new gallery', function () {
        $weth = Token::factory()->wethWithPrices()->create();

        $user = createUser();
        $collection = Collection::factory()->create([
            'floor_price' => 2.1 * 1e18,
            'floor_price_token_id' => $weth->id,
        ]);
        $nft = Nft::factory()->create([
            'collection_id' => $collection->id,
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'nfts' => [$nft->id],
                'coverImage' => null,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $gallery = $user->refresh()->galleries()->where('name', 'Test')->first()));

        expect(round($gallery->value(CurrencyCode::USD)))->toBe(round(2.1 * 1769.02));
    });

    it('can not create a gallery without required data', function () {
        $user = createUser();
        Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => '',
                'nfts' => [],
                'coverImage' => null,
            ])
            ->assertInvalid(['name', 'nfts']);
    });

    it('should not create a gallery if NFT does not have a valid large image', function () {
        $user = createUser();

        $nftWithNullImage = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
            'extra_attributes' => [
                'images' => [
                    'large' => null,
                ],
            ],
        ]);

        $nftWithEmptyImage = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
            'extra_attributes' => [
                'images' => [
                    'large' => '',
                ],
            ],
        ]);

        $nftWithNoImage = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
            'extra_attributes' => [
                'images' => [],
            ],
        ]);

        $validNft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'nfts' => [
                    $nftWithNullImage->id,
                    $nftWithEmptyImage->id,
                    $nftWithNoImage->id,
                    $validNft->id,
                ],
                'coverImage' => null,
            ])
            ->assertInvalid([
                'nfts.0',
                'nfts.1',
                'nfts.2',
            ]);

    });

    it('can not create a gallery with nfts that are not owned by the user', function () {
        $user = createUser();
        $nft = Nft::factory()->create();

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'nfts' => [$nft->id],
                'coverImage' => null,
            ])
            ->assertInvalid(['nfts.0']);
    });

    it('can create a gallery with a cover image', function () {
        Storage::fake('public');

        $image = UploadedFile::fake()->image('coverImage.jpg');

        Storage::disk('public')->assertMissing('galleryCoverImages/'.$image->hashName());

        $user = createUser();
        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'nfts' => [$nft->id],
                'coverImage' => $image,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $user->refresh()->galleries()->where('name', 'Test')->first()));

        Storage::disk('public')->assertExists('galleryCoverImages/'.$image->hashName());
    });

    it('does not allow cover images with the wrong mimetype', function () {
        Storage::fake('public');

        $image = UploadedFile::fake()->image('coverImage.svg');

        $user = createUser();
        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'nfts' => [$nft->id],
                'coverImage' => $image,
            ])
            ->assertInvalid('coverImage');
    });

    it('can edit a gallery based on id by posting required data', function () {
        $user = createUser();

        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $gallery = Gallery::factory()->create(['user_id' => $user]);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'id' => $gallery->id,
                'nfts' => [$nft->id],
                'coverImage' => null,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $gallery->refresh()));

        expect($gallery->name)->toBe('Test');
        expect($gallery->nfts)->toHaveCount(1);
        expect($gallery->nfts->first()->id)->toBe($nft->id);
    });

    it('can edit a gallery cover image with an uploaded file', function () {
        Storage::fake('public');

        $image = UploadedFile::fake()->image('coverImage.jpg');

        Storage::disk('public')->assertMissing('galleryCoverImages/'.$image->hashName());

        $user = createUser();

        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $gallery = Gallery::factory()->create([
            'user_id' => $user,
            'cover_image' => null,
        ]);

        expect($gallery->coverImage)->toBe(null);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'id' => $gallery->id,
                'nfts' => [$nft->id],
                'coverImage' => $image,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $gallery->refresh()));

        expect($gallery->name)->toBe('Test');
        expect($gallery->nfts)->toHaveCount(1);
        expect($gallery->nfts->first()->id)->toBe($nft->id);

        Storage::disk('public')->assertExists('galleryCoverImages/'.$image->hashName());
    });

    it('can edit a gallery and handle the cover image not changing', function () {
        $user = createUser();

        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $gallery = Gallery::factory()->create([
            'user_id' => $user,
            'cover_image' => 'galleryCoverImages/testimg.png',
        ]);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'id' => $gallery->id,
                'nfts' => [$nft->id],
                'coverImage' => $gallery->cover_image,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $gallery->refresh()));

        expect($gallery->name)->toBe('Test');
        expect($gallery->nfts)->toHaveCount(1);
        expect($gallery->nfts->first()->id)->toBe($nft->id);
        expect($gallery->cover_image)->toBe('galleryCoverImages/testimg.png');
    });

    it('should not edit a gallery if the cover image is a string and does not match existing image', function () {
        $user = createUser();

        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $gallery = Gallery::factory()->create([
            'user_id' => $user,
            'name' => 'Awesome Gallery',
            'cover_image' => 'galleryCoverImages/testimg.png',
        ]);

        $gallery->nfts()->attach($nft, ['order_index' => 0]);

        $gallery->refresh();

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'id' => $gallery->id,
                'name' => 'Test',
                'nfts' => [$nft->id],
                'coverImage' => 'different-test-img.png',
            ])
            ->assertInvalid('coverImage');

        $gallery->refresh();

        expect($gallery->name)->toBe('Awesome Gallery');
        expect($gallery->cover_image)->toBe('galleryCoverImages/testimg.png');
    });

    it('should update nfts when editing a gallery', function () {
        $user = createUser();

        $gallery = Gallery::factory()->create([
            'user_id' => $user,
            'name' => 'Awesome Gallery',
            'cover_image' => 'galleryCoverImages/testimg.png',
        ]);

        $oldNft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $newNft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $gallery->nfts()->attach($oldNft, ['order_index' => 0]);

        $gallery->refresh();

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'id' => $gallery->id,
                'name' => 'Test',
                'nfts' => [$newNft->id],
                'coverImage' => $gallery->cover_image,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $gallery->refresh()));

        expect($gallery->name)->toBe('Test');
        expect($gallery->nfts)->toHaveCount(1);
        expect($gallery->nfts->first()->id)->toBe($newNft->id);
    });

    it('should clear gallery cache when a gallery is updated', function () {
        $user = createUser();

        $gallery = Gallery::factory()->create([
            'user_id' => $user,
            'name' => 'Awesome Gallery',
            'cover_image' => 'galleryCoverImages/testimg.png',
        ]);

        $oldNft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $newNft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $gallery->nfts()->attach($oldNft, ['order_index' => 0]);

        expect((new GalleryCache($gallery))->nftsCount())->toBe(1);
        expect((new GalleryCache($gallery))->collectionsCount())->toBe(1);
        expect((new GalleryCache($gallery))->collections(CurrencyCode::USD)->count())->toBe(1);

        $gallery->refresh();

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'id' => $gallery->id,
                'name' => 'Test',
                'nfts' => [
                    $oldNft->id,
                    $newNft->id,
                ],
                'coverImage' => $gallery->cover_image,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $gallery->refresh()));

        expect($gallery->name)->toBe('Test');
        expect($gallery->nfts)->toHaveCount(2);
        expect($gallery->nfts->first()->pluck('id')->toArray())->toBe([
            $oldNft->id,
            $newNft->id,
        ]);

        expect((new GalleryCache($gallery))->nftsCount())->toBe(2);
        expect((new GalleryCache($gallery))->collectionsCount())->toBe(2);
        expect((new GalleryCache($gallery))->collections(CurrencyCode::USD)->count())->toBe(2);
    });

    it('should clear user cache when a gallery is updated', function () {
        $user = createUser();
        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $userCache = UserCache::from($user);

        expect($userCache->galleriesCount())->toBe(0);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'name' => 'Test',
                'nfts' => [$nft->id],
                'coverImage' => null,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $user->refresh()->galleries()->where('name', 'Test')->first()));

        expect($userCache->galleriesCount())->toBe(1);
    });

    it('should handle uploaded image not saving', function () {
        $image = UploadedFile::fake()->image('coverImage.jpg');

        $user = createUser();

        $gallery = Gallery::factory()->create([
            'user_id' => $user,
            'name' => 'Awesome Gallery',
            'cover_image' => 'galleryCoverImages/testimg.png',
        ]);

        $nft = Nft::factory()->create([
            'wallet_id' => $user->wallet->id,
        ]);

        $gallery->nfts()->attach($nft, ['order_index' => 0]);

        expect((new GalleryCache($gallery))->nftsCount())->toBe(1);
        expect((new GalleryCache($gallery))->collectionsCount())->toBe(1);

        $gallery->refresh();

        Storage::shouldReceive('disk->put')
            ->andReturn(false);

        $this->actingAs($user)
            ->post(route('my-galleries.store'), [
                'id' => $gallery->id,
                'name' => 'Test',
                'nfts' => [$nft->id],
                'coverImage' => $image,
            ])
            ->assertValid()
            ->assertRedirect(route('galleries.view', $gallery->refresh()));

        expect($gallery->name)->toBe('Test');
        expect($gallery->cover_image)->toBeNull();
    });
});

describe('user is not signed', function () {
    beforeEach(function () {
        Signature::shouldReceive('walletIsSigned')
            ->andReturn(false);
    });

    it('can render the "create" page', function () {
        $user = createUser();

        Nft::factory()->create(['wallet_id' => $user->wallet->id]);

        $this->actingAs($user)
            ->get(route('my-galleries.create'))
            ->assertStatus(200);
    });

    it('can render the "edit" page if owns the gallery', function () {
        $user = createUser();

        $gallery = Gallery::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->actingAs($user)
            ->get(route('my-galleries.edit', $gallery))
            ->assertOk();
    });

});
