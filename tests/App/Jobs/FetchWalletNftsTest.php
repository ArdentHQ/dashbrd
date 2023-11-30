<?php

declare(strict_types=1);

use App\Enums\TraitDisplayType;
use App\Jobs\FetchCollectionFloorPrice;
use App\Jobs\FetchWalletNfts;
use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\GalleryNftsChanged;
use App\Support\Cache\GalleryCache;
use App\Support\Cache\UserCache;
use App\Support\Facades\Alchemy;
use App\Support\Web3NftHandler;
use Carbon\Carbon;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;

it('should fetch nfts for wallet', function () {
    Bus::fake();

    Alchemy::fake(Http::response(fixtureData('alchemy.nfts_for_owner_2'), 200));

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    $this->assertDatabaseCount('collections', 3);
    $this->assertDatabaseCount('nfts', 4);

    expect(Collection::whereNotNull('last_indexed_token_number')->count())->toBe(0);
});

it('should fetch nfts for wallet and handle empty response', function () {
    Alchemy::fake([
        '*' => Http::response(['result' => ['ownedNfts' => []]], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);
});

it('should fetch nfts for wallet and dispatch floor price job', function () {
    Bus::fake();

    Alchemy::fake(Http::response(fixtureData('alchemy.nfts_for_owner_2'), 200));

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    $this->assertDatabaseCount('collections', 3);
    $this->assertDatabaseCount('nfts', 4);

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 3);
});

it('should fetch nfts for wallet and skip floor price job if already present', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::response(getTestNfts(1)),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();
    Token::factory()->create(['network_id' => $network->id, 'symbol' => 'eth']);

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    Bus::assertDispatchedTimes(FetchCollectionFloorPrice::class, 0);
});

it('should use the wallet id as a unique job identifier', function () {
    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $uniqueId = (new FetchWalletNfts($wallet, $network,
        'cursor'))->uniqueId();

    expect($uniqueId)->toBe('App\Jobs\FetchWalletNfts:'.$wallet->id.':'.$network->chain_id.':cursor');
});

it('should detach no longer owned nfts', function () {
    Bus::fake();
    Notification::fake();

    config([
        'dashbrd.gallery.logs.enabled' => true,
    ]);

    Alchemy::fake([
        '*' => Http::sequence()
            ->push(getTestNfts(3))
            ->push(getTestNfts(2))
            ->push(['ownedNfts' => []])
            ->push(getTestNfts(2)),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    expect($wallet->nfts()->count())->toBe(3)->and(Nft::count())->toBe(3);

    // this is to imitate `updated_at` column in db
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    (new FetchWalletNfts($wallet, $network))->handle();

    expect($wallet->nfts()->count())->toBe(2)->and(Nft::count())->toBe(3);

    // No more NFTs
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    (new FetchWalletNfts($wallet, $network))->handle();

    expect($wallet->nfts()->count())->toBe(0)->and(Nft::count())->toBe(3);

    // detached NFTs can also be restored just fine
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    (new FetchWalletNfts($wallet, $network))->handle();

    expect($wallet->nfts()->count())->toBe(2)->and(Nft::count())->toBe(3);

    Notification::assertSentTo(
        new AnonymousNotifiable(),
        function (GalleryNftsChanged $notification) use ($wallet) {
            $slackMessage = $notification->toSlack(new AnonymousNotifiable())->attachments[0];

            expect($notification->walletAddress)->toBe($wallet->address);
            expect($slackMessage->fields['nfts'])->toBeString();

            return true;
        }
    );
});

it('should soft delete gallery when all nfts have been soft deleted', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            ->push(getTestNfts(3))
            ->push(getTestNfts(1, 2))
            ->push(['ownedNfts' => []]),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);
    $this->assertDatabaseCount('galleries', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    expect(Nft::count())->toBe(3);

    $this->assertDatabaseCount('galleries', 0);

    // Create 2 galleries with NFTs
    $galleries = Gallery::factory()->createMany([
        [
            'user_id' => $wallet->user->id,
            'name' => 'BRDY',
            'cover_image' => 'BRDY',
        ], [
            'user_id' => $wallet->user->id,
            'name' => 'BRDY2',
            'cover_image' => 'BRDY2',
        ],
    ]);

    $nfts = Nft::where('wallet_id', $wallet->id)->orderBy('collection_id')->orderBy('id')->get();

    $galleries[0]->nfts()->attach($nfts[0], ['order_index' => 0]);
    $galleries[0]->nfts()->attach($nfts[1], ['order_index' => 0]);
    $galleries[1]->nfts()->attach($nfts[2], ['order_index' => 0]);

    $this->assertDatabaseCount('nft_gallery', 3);
    $this->assertDatabaseCount('galleries', 2);

    // Fetch again, now the first gallery is deleted due to the NFTs being removed from the wallet
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    (new FetchWalletNfts($wallet, $network))->handle();

    // Same amout
    $this->assertDatabaseCount('nft_gallery', 3);
    $this->assertDatabaseCount('galleries', 2);

    // Only one gallery is not deleted
    expect(DB::select('select count(*) as count from nft_gallery where deleted_at is null')[0]->count)->toBe(1);

    expect($wallet->nfts()->count())->toBe(1)
        ->and(Gallery::where('name', 'BRDY')->first())->toBeNull()
        ->and(Gallery::withTrashed()->where('name', 'BRDY')->first())->not->toBeNull()
        ->and(Gallery::where('name', 'BRDY2')->first())->not()->toBeNull();

    // Fetch once more, now all galleries are deleted due to the wallet no longner owning any NFTs
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    (new FetchWalletNfts($wallet, $network))->handle();

    expect($wallet->nfts()->count())->toBe(0);

    // Still two in the database since both were soft deleted
    $this->assertDatabaseCount('galleries', 2);
});

it('should not soft delete gallery if not all nfts were deleted', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            ->push(getTestNfts(2))
            ->push(getTestNfts(1)),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);
    $this->assertDatabaseCount('galleries', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    expect(Nft::count())->toBe(2);

    // Create galleries with NFTs
    $gallery = Gallery::factory()->create([
        'user_id' => $wallet->user->id,
        'name' => 'BRDY',
        'cover_image' => 'BRDY',

    ]);

    $nfts = Nft::where('wallet_id', $wallet->id)->orderBy('collection_id')->orderBy('id')->get();

    $gallery->nfts()->attach($nfts[0], ['order_index' => 0]);
    $gallery->nfts()->attach($nfts[1], ['order_index' => 0]);

    // Fetch again, now the first gallery is deleted due to the NFTs being removed from the wallet
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    (new FetchWalletNfts($wallet, $network))->handle();

    expect($gallery->nfts()->count())->toBe(1);

    expect($gallery->fresh()->trashed())->toBeFalse();
});

it('should delete gallery when all nfts have been assigned to another wallet', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            ->push(getTestNfts(3))
            ->push(getTestNfts(3)),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();
    $wallet2 = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);
    $this->assertDatabaseCount('galleries', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    expect(Nft::count())->toBe(3);

    $this->assertDatabaseCount('galleries', 0);

    // Create 2 galleries with NFTs
    $galleries = Gallery::factory()->createMany([
        [
            'user_id' => $wallet->user->id,
            'name' => 'BRDY',
            'cover_image' => 'BRDY',
        ], [
            'user_id' => $wallet->user->id,
            'name' => 'BRDY2',
            'cover_image' => 'BRDY2',
        ],
    ]);

    $nfts = Nft::where('wallet_id', $wallet->id)->orderBy('collection_id')->orderBy('id')->get();

    $galleries[0]->nfts()->attach($nfts[0], ['order_index' => 0]);
    $galleries[0]->nfts()->attach($nfts[1], ['order_index' => 0]);
    $galleries[1]->nfts()->attach($nfts[2], ['order_index' => 0]);

    $this->assertDatabaseCount('nft_gallery', 3);
    $this->assertDatabaseCount('galleries', 2);

    // Fetch again, now the first gallery is deleted due to the NFTs being removed from the wallet
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    // assigning nfts to wallet 2
    (new FetchWalletNfts($wallet2, $network))->handle();

    // Nft gallery relationship and galleries should be completely deleted

    $this->assertDatabaseCount('nft_gallery', 0);

    $this->assertDatabaseCount('galleries', 0);
});

it('should keep gallery if only one nft is assigned to another wallet', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            ->push(getTestNfts(3))
            ->push(getTestNfts(1)),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();
    $wallet2 = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);
    $this->assertDatabaseCount('galleries', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    expect(Nft::count())->toBe(3);

    $this->assertDatabaseCount('galleries', 0);

    // Create 2 galleries with NFTs
    $galleries = Gallery::factory()->createMany([
        [
            'user_id' => $wallet->user->id,
            'name' => 'BRDY',
            'cover_image' => 'BRDY',
        ], [
            'user_id' => $wallet->user->id,
            'name' => 'BRDY2',
            'cover_image' => 'BRDY2',
        ],
    ]);

    $nfts = Nft::where('wallet_id', $wallet->id)->orderBy('collection_id')->orderBy('id')->get();

    $galleries[0]->nfts()->attach($nfts[0], ['order_index' => 0]);
    $galleries[0]->nfts()->attach($nfts[1], ['order_index' => 0]);
    $galleries[1]->nfts()->attach($nfts[2], ['order_index' => 0]);

    $this->assertDatabaseCount('nft_gallery', 3);
    $this->assertDatabaseCount('galleries', 2);

    // Fetch again, now the first gallery is deleted due to the NFTs being removed from the wallet
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    // assigning nfts to wallet 2
    (new FetchWalletNfts($wallet2, $network))->handle();

    // Nft gallery relationship and galleries should be completely deleted

    $this->assertDatabaseCount('nft_gallery', 2);

    $this->assertDatabaseCount('galleries', 2);
});

it('should recover a soft deleted gallery if a nft is added again', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            ->push(getTestNfts(3))
            ->push(['ownedNfts' => []])
            ->push(getTestNfts(3)),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);
    $this->assertDatabaseCount('galleries', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    expect(Nft::count())->toBe(3);

    $this->assertDatabaseCount('galleries', 0);

    // Create 2 galleries with NFTs
    $galleries = Gallery::factory()->createMany([
        [
            'user_id' => $wallet->user->id,
            'name' => 'BRDY',
            'cover_image' => 'BRDY',
        ], [
            'user_id' => $wallet->user->id,
            'name' => 'BRDY2',
            'cover_image' => 'BRDY2',
        ],
    ]);

    $nfts = Nft::where('wallet_id', $wallet->id)->orderBy('collection_id')->orderBy('id')->get();

    $galleries[0]->nfts()->attach($nfts[0], ['order_index' => 0]);
    $galleries[0]->nfts()->attach($nfts[1], ['order_index' => 0]);
    $galleries[1]->nfts()->attach($nfts[2], ['order_index' => 0]);

    expect($wallet->nfts()->count())->toBe(3);
    expect($galleries[0]->nfts()->count())->toBe(2);
    expect($galleries[1]->nfts()->count())->toBe(1);
    expect(Gallery::count())->toBe(2);

    // Fetch, should soft delete the galleries and nfts
    Carbon::setTestNow(now()->addSecond());
    Cache::flush();
    (new FetchWalletNfts($wallet, $network))->handle();

    expect($wallet->nfts()->count())->toBe(0);
    expect($galleries[0]->nfts()->count())->toBe(0);
    expect($galleries[1]->nfts()->count())->toBe(0);
    expect(Gallery::count())->toBe(0);

    // Fetch again, should recover the galleries and nfts
    Carbon::setTestNow(now()->addSecond());
    Cache::flush();
    (new FetchWalletNfts($wallet, $network))->handle();

    expect($wallet->fresh()->nfts()->count())->toBe(3);
    expect($galleries[0]->nfts()->count())->toBe(2);
    expect($galleries[1]->nfts()->count())->toBe(1);
    expect(Gallery::count())->toBe(2);
});

it('should handle NFT owner changes', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            // wallet1 call
            ->push(getTestNfts(3))
            // wallet2 call (third nft moves from wallet1)
            ->push(getTestNfts(1, 2))
            // wallet1 call again (third nft moves back to wallet1)
            ->push(getTestNfts(3))
            // wallet2 call (empty response)
            ->push(['ownedNfts' => []]),
    ]);

    $network = Network::polygon();
    $wallet1 = Wallet::factory()->create();
    $wallet2 = Wallet::factory()->create();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);
    $this->assertDatabaseCount('galleries', 0);

    (new FetchWalletNfts($wallet1, $network))->handle();

    expect(Nft::count())->toBe(3);

    $wallet1Nfts = Nft::where('wallet_id', $wallet1->id)->get()->toArray();
    expect($wallet1Nfts)->toHaveLength(3)->and(Nft::count())->toBe(3);

    // Fetch Wallet2 - we discover an NFT that is already on Wallet1, so it is moved.
    Carbon::setTestNow(now()->addSecond());
    Cache::flush();
    (new FetchWalletNfts($wallet2, $network))->handle();

    $wallet1Nfts = Nft::where('wallet_id', $wallet1->id)->get()->toArray();
    expect($wallet1Nfts)->toHaveLength(2);

    $wallet2Nfts = Nft::where('wallet_id', $wallet2->id)->get()->toArray();
    expect($wallet2Nfts)->toHaveLength(1)->and(Nft::count())->toBe(3);

    // Fetch Wallet1 - we discover the NFT moved back to Wallet1 leaving Wallet2 empty
    Carbon::setTestNow(now()->addSecond());
    Cache::flush();
    (new FetchWalletNfts($wallet1, $network))->handle();

    $wallet1Nfts = Nft::where('wallet_id', $wallet1->id)->get()->toArray();
    expect($wallet1Nfts)->toHaveLength(3);

    $wallet2Nfts = Nft::where('wallet_id', $wallet2->id)->get()->toArray();
    expect($wallet2Nfts)->toHaveLength(0)->and(Nft::count())->toBe(3);

    // Fetch Wallet2 - nothing changes since it's already empty
    Carbon::setTestNow(now()->addSecond());
    Cache::flush();
    (new FetchWalletNfts($wallet2, $network))->handle();

    $wallet1Nfts = Nft::where('wallet_id', $wallet1->id)->get()->toArray();
    expect($wallet1Nfts)->toHaveLength(3);

    $wallet2Nfts = Nft::where('wallet_id', $wallet2->id)->get()->toArray();
    expect($wallet2Nfts)->toHaveLength(0)->and(Nft::count())->toBe(3);
});

it('should delete gallery of previous owner if it becomes empty', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            // Wallet1
            ->push(getTestNfts(3))
            // Wallet2
            ->push(getTestNfts(1, 2)),
    ]);

    $network = Network::polygon();
    $wallet1 = Wallet::factory()->create();
    $wallet2 = Wallet::factory()->create();

    (new FetchWalletNfts($wallet1, $network))->handle();

    expect(Nft::count())->toBe(3);
    $this->assertDatabaseCount('galleries', 0);

    // Create 2 galleries for wallet1
    $galleries = Gallery::factory()->createMany([[
        'user_id' => $wallet1->user->id,
        'name' => 'BRDY',
        'cover_image' => 'BRDY',
    ], [
        'user_id' => $wallet1->user->id,
        'name' => 'BRDY2',
        'cover_image' => 'BRDY2',
    ]]);

    $nfts = Nft::where('wallet_id', $wallet1->id)->orderBy('collection_id')->orderBy('id')
        ->get();

    $galleries[0]->nfts()->attach($nfts[0], ['order_index' => 0]);
    $galleries[0]->nfts()->attach($nfts[1], ['order_index' => 0]);
    $galleries[1]->nfts()->attach($nfts[2], ['order_index' => 0]);

    $this->assertDatabaseCount('galleries', 2);

    // Fetch wallet2, which now owns the NFT from wallet1's second gallery thus deleting the second gallery.
    Carbon::setTestNow(now()->addSecond());
    Cache::flush();
    (new FetchWalletNfts($wallet2, $network))->handle();

    expect(Gallery::count())->toBe(1);
    expect(Gallery::withTrashed()->count())->toBe(1);

    expect($wallet1->nfts()->count())->toBe(2)
        ->and($wallet2->nfts()->count())->toBe(1)
        ->and(Gallery::where('name', 'BRDY')->first())->not()->toBeNull()
        ->and(Gallery::where('name', 'BRDY2')->first())->toBeNull()
        ->and(Gallery::where('name', 'BRDY2')->withTrashed()->first())->toBeNull();

});

it('should not delete gallery/nfts of local testing wallet', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            ->push(getTestNfts(3))
            ->push(['ownedNfts' => []])
            ->push(['ownedNfts' => []]),
    ]);

    $network = Network::polygon();
    $wallet1 = Wallet::factory()->create();

    config(['dashbrd.testing_wallet' => $wallet1->address]);

    (new FetchWalletNfts($wallet1, $network))->handle();

    expect(Nft::count())->toBe(3);
    $this->assertDatabaseCount('galleries', 0);

    // Create 2 galleries for wallet1
    $galleries = Gallery::factory()->createMany([
        [
            'user_id' => $wallet1->user->id,
            'name' => 'BRDY',
            'cover_image' => 'BRDY',
        ], [
            'user_id' => $wallet1->user->id,
            'name' => 'BRDY2',
            'cover_image' => 'BRDY2',
        ],
    ]);

    $nfts = Nft::where('wallet_id', $wallet1->id)->orderBy('collection_id')->orderBy('id')
        ->get();

    $galleries[0]->nfts()->attach($nfts[0], ['order_index' => 0]);
    $galleries[0]->nfts()->attach($nfts[1], ['order_index' => 0]);
    $galleries[1]->nfts()->attach($nfts[2], ['order_index' => 0]);

    expect(Gallery::count())->toBe(2);

    // Fetch wallet2, which now owns the NFT from wallet1's second gallery thus deleting the second gallery.
    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    (new FetchWalletNfts($wallet1, $network))->handle();

    expect(Gallery::count())->toBe(2);
    expect(Nft::where('wallet_id', $wallet1->id)->get())->toHaveCount(3)
        ->and(Gallery::where('name', 'BRDY')->first())->not()->toBeNull()
        ->and(Gallery::where('name', 'BRDY2')->first())->not()->toBeNull();

    // unset and assert that nfts are deleted again
    config(['dashbrd.testing_wallet' => null]);

    Carbon::setTestNow(now()->addSecond());

    Cache::flush();

    (new FetchWalletNfts($wallet1, $network))->handle();

    expect(Gallery::count())->toBe(0);

    expect(Nft::where('wallet_id', $wallet1->id)->get())->toHaveCount(0);
});

it('should clear gallery & user cache', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
                    ->push(fixtureData('alchemy.nfts_for_owner_2'))
                    ->push(fixtureData('alchemy.nfts_for_owner_2')),
    ]);

    [$user1, $user2] = User::factory(2)->create();

    $gallery = Gallery::factory()->create([
        'user_id' => $user1,
    ]);
    $userCache = new UserCache($user1);
    $galleryCache = new GalleryCache($gallery);

    expect($galleryCache->nftsCount())->toBe(0)
        ->and($userCache->nftsCount())->toBe(0);

    $network = Network::polygon();
    [$wallet1, $wallet2] = Wallet::factory()->createMany([
        ['user_id' => $user1],
        ['user_id' => $user2],
    ]);

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);

    // Fetch same NFTs with a different wallet
    (new FetchWalletNfts($wallet1, $network))->handle();

    $this->assertDatabaseCount('collections', 3);
    $this->assertDatabaseCount('nfts', 4);
    $this->assertDatabaseCount('galleries_dirty', 0);

    expect($galleryCache->nftsCount())->toBe(0)
        ->and($userCache->nftsCount())->toBe(4);

    $nfts = Nft::query()->get();
    $nfts->each(function ($nft) use ($gallery) {
        $gallery->nfts()->attach($nft, ['order_index' => 0]);
    });
    $this->assertDatabaseCount('galleries_dirty', 1);

    expect($galleryCache->nftsCount())->toBe(0)
        ->and($userCache->nftsCount())->toBe(4);

    GalleryCache::clearAllDirty();

    expect($galleryCache->nftsCount())->toBe(4)
        ->and($userCache->nftsCount())->toBe(4);

    (new FetchWalletNfts($wallet2, $network))->handle();

    expect($galleryCache->nftsCount())->toBe(0);
});

it('should fetch nfts for wallet with default provider', function () {
    Bus::fake();

    Config::set('dashbrd.web3_providers.default', 'alchemy');
    Config::set('dashbrd.web3_providers.App\Jobs\FetchWalletNfts');

    Alchemy::fake([
        '*' => Http::response(['result' => ['ownedNfts' => []]], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    (new FetchWalletNfts($wallet, $network))->handle();

    $this->assertDatabaseCount('collections', 0);
    $this->assertDatabaseCount('nfts', 0);
});

it('should not store base64 encoded asset images', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::response([
            'ownedNfts' => [
                [
                    'tokenId' => '0x0000000000000000000000000000000000000000000000000000000000000c92',
                    'name' => 'tiny dinos #3218',
                    'contract' => [
                        'address' => '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
                        'tokenType' => 'ERC721',
                        'name' => 'tiny dinos',
                        'symbol' => 'dino',
                        'deployedBlockNumber' => 10000,
                        'totalSupply' => 10,
                        'openSeaMetadata' => [
                            'imageUrl' => 'https://opensea.com/image.jpg',
                        ],
                    ],
                    'image' => [
                        'cachedUrl' => 'https://gateway.com/image.jpg',
                        'originalUrl' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAREDACTED',
                        'thumbnailUrl' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAREDACTED',
                    ],
                    'raw' => [
                        'error' => null,
                    ],
                ],
            ],
        ], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    (new FetchWalletNfts($wallet, $network))->handle();

    $nft = Nft::firstWhere('name', 'tiny dinos #3218');

    expect($nft->extra_attributes->get('images'))->toBe([
        'thumb' => 'https://opensea.com/image.jpg',
        'small' => 'https://opensea.com/image.jpg',
        'large' => 'https://opensea.com/image.jpg',
        'originalRaw' => null,
        'original' => 'https://gateway.com/image.jpg',
    ]);
});

it('should use media thumbnail for collection image if no opensea image url', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::response([
            'ownedNfts' => [
                [
                    'tokenId' => '0x0000000000000000000000000000000000000000000000000000000000000c92',
                    'contract' => [
                        'address' => '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
                        'tokenType' => 'ERC721',
                        'name' => 'tiny dinos',
                        'symbol' => 'dino',
                        'deployedBlockNumber' => 10000,
                        'totalSupply' => 10,
                        'openSeaMetadata' => [
                            'imageUrl' => null,
                        ],
                    ],
                    'image' => [
                        'cachedUrl' => 'https://gateway.com/image.jpg',
                        'originalUrl' => 'https://raw.com/image.jpg',
                        'thumbnailUrl' => 'https://thumb.com/image.jpg',
                    ],
                    'name' => 'tiny dinos #3218',
                ],
            ],
        ], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    (new FetchWalletNfts($wallet, $network))->handle();

    $nft = Nft::firstWhere('name', 'tiny dinos #3218');

    expect($nft->extra_attributes->get('images'))->toBe([
        'thumb' => 'https://thumb.com/image.jpg',
        'small' => 'https://thumb.com/image.jpg',
        'large' => 'https://thumb.com/image.jpg',
        'originalRaw' => 'https://raw.com/image.jpg',
        'original' => 'https://gateway.com/image.jpg',
    ])
        ->and($nft->collection->image())->toBe('https://thumb.com/image.jpg');

});

it('should use media gateway for collection image if no opensea image url', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::response([
            'ownedNfts' => [
                [
                    'tokenId' => '0x000000000000000000000000000000000000000000000000000000000000092',
                    'contract' => [
                        'address' => '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
                        'tokenType' => 'ERC721',
                        'name' => 'tiny dinos',
                        'symbol' => 'dino',
                        'deployedBlockNumber' => 10000,
                        'totalSupply' => 10,
                        'openSeaMetadata' => [
                            'imageUrl' => null,
                        ],
                    ],
                    'image' => [
                        'cachedUrl' => 'https://gateway.com/image.jpg',
                        'thumbnailUrl' => null,
                    ],
                    'name' => 'tiny dinos #3218',
                ],
            ],
        ], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    (new FetchWalletNfts($wallet, $network))->handle();

    $nft = Nft::firstWhere('name', 'tiny dinos #3218');

    expect($nft->extra_attributes->get('images'))->toBe([
        'thumb' => null,
        'small' => null,
        'large' => null,
        'originalRaw' => null,
        'original' => 'https://gateway.com/image.jpg',
    ])
        ->and($nft->collection->image())->toBe('https://gateway.com/image.jpg');

});

it('should not store original asset image if it is in base64 encoded format', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::response([
            'ownedNfts' => [
                [
                    'tokenId' => '0x0000000000000000000000000000000000000000000000000000000000000c92',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'address' => '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
                        'name' => 'tiny dinos', 'symbol' => 'dino',
                        'deployedBlockNumber' => 10000,
                        'totalSupply' => 10,
                        'openSeaMetadata' => [
                            'imageUrl' => null,
                        ],
                    ],
                    'image' => [
                        'cachedUrl' => 'https://gateway.com/image.jpg',
                        'originalUrl' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAREDACTED',
                        'thumbnailUrl' => null,
                    ],
                    'name' => 'tiny dinos #3218',
                ],
            ],
        ], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    (new FetchWalletNfts($wallet, $network))->handle();

    $nft = Nft::firstWhere('name', 'tiny dinos #3218');

    expect($nft->extra_attributes->get('images')['originalRaw'])->toBe(null);
});

it('should extract social details from opensea', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::response([
            'ownedNfts' => [
                [
                    'tokenId' => '0x0000000000000000000000000000000000000000000000000000000000000c92',
                    'contract' => [
                        'address' => '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
                        'tokenType' => 'ERC721',
                        'name' => 'tiny dinos', 'symbol' => 'dino',
                        'totalSupply' => 10,
                        'deployedBlockNumber' => 10000,
                        'openSeaMetadata' => [
                            'imageUrl' => null,
                            'twitterUsername' => 'testuser',
                            'discordUrl' => 'https://discord.gg/testuser',
                        ],
                    ],
                    'image' => [
                        'cachedUrl' => 'https://gateway.com/image.jpg',
                        'thumbnailUrl' => null,
                    ],
                    'name' => 'tiny dinos #3218',
                ],
            ],
        ], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    (new FetchWalletNfts($wallet, $network))->handle();

    $nft = Nft::firstWhere('name', 'tiny dinos #3218');

    expect($nft->extra_attributes->get('socials'))->toBeNull();

    $collection = $nft->collection;

    expect($collection->twitter())->toBe('https://x.com/testuser');
    expect($collection->discord())->toBe('https://discord.gg/testuser');
    expect($collection->extra_attributes->get('socials.twitter'))->toBe('testuser');
    expect($collection->extra_attributes->get('socials.discord'))->toBe('testuser');
});

it('should use opensea description for collection', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::response([
            'ownedNfts' => [
                [
                    'tokenId' => '0x0000000000000000000000000000000000000000000000000000000000000c92',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'address' => '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
                        'name' => 'tiny dinos', 'symbol' => 'dino',
                        'totalSupply' => 10,
                        'deployedBlockNumber' => 10000,
                        'openSeaMetadata' => [
                            'description' => 'This is a sample collection.',
                        ],
                    ],
                    'image' => [
                        'cachedUrl' => 'https://gateway.com/image.jpg',
                        'thumbnailUrl' => null,
                    ],
                    'name' => 'tiny dinos #3218',
                ],
            ],
        ], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    (new FetchWalletNfts($wallet, $network))->handle();

    $nft = Nft::firstWhere('name', 'tiny dinos #3218');

    expect($nft->collection->description)->toBe('This is a sample collection.');
});

it('should handle nft traits', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::response([
            'ownedNfts' => [
                [
                    'tokenId' => '0x0000000000000000000000000000000000000000000000000000000000000c92',
                    'contract' => [
                        'tokenType' => 'ERC721',
                        'address' => '0xd9b78a2f1dafc8bb9c60961790d2beefebee56f4',
                        'name' => 'tiny dinos', 'symbol' => 'dino',
                        'deployedBlockNumber' => 10000,
                        'totalSupply' => 10,
                        'openSea' => [
                            'imageUrl' => null,
                        ],
                    ],
                    'image' => [
                        'cachedUrl' => 'https://gateway.com/image.jpg',
                        'thumbnailUrl' => 'https://thumb.com/image.jpg',
                    ],
                    'name' => 'tiny dinos #3218',
                    'raw' => [
                        'metadata' => [
                            'attributes' => [
                                [
                                    'value' => 'Slang',
                                    'trait_type' => 'Background',
                                ],
                                [
                                    'value' => 35,
                                    'trait_type' => 'Soy %',
                                    'display_type' => 'number',
                                ],
                                [
                                    'value' => '2022-12-01 00:00:00',
                                    'trait_type' => 'Creation Date',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ], 200),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    (new FetchWalletNfts($wallet, $network))->handle();

    $this->assertDatabaseCount('collection_traits', 3);
    $this->assertDatabaseCount('nft_trait', 3);

    $nft = Nft::firstOrFail();
    expect($nft->traits)->toHaveLength(3)
        ->and($nft->traits[0]['name'])->toBe('Background')
        ->and($nft->traits[0]['value'])->toBe('Slang')
        ->and($nft->traits[0]['display_type'])->toBe(TraitDisplayType::Property->value)
        ->and($nft->traits[0]->pivot->value_string)->toBe('Slang')
        ->and($nft->traits[0]->pivot->value_numeric)->toBeNull()
        ->and($nft->traits[0]->pivot->value_date)->toBeNull()
        ->and($nft->traits[1]['name'])->toBe('Soy %')
        ->and($nft->traits[1]['value'])->toBe(Web3NftHandler::$numericTraitPlaceholder)
        ->and($nft->traits[1]['display_type'])->toBe(TraitDisplayType::Stat->value)
        ->and($nft->traits[1]->pivot->value_string)->toBeNull()
        ->and($nft->traits[1]->pivot->value_numeric)->toBe('35')
        ->and($nft->traits[1]->pivot->value_date)->toBeNull()
        ->and($nft->traits[2]['name'])->toBe('Creation Date')
        ->and($nft->traits[2]['value'])->toBe('-')
        ->and($nft->traits[2]['display_type'])->toBe(TraitDisplayType::Date->value)
        ->and($nft->traits[2]->pivot->value_string)->toBeNull()
        ->and($nft->traits[2]->pivot->value_numeric)->toBeNull()
        ->and($nft->traits[2]->pivot->value_date)->toBe('2022-12-01 00:00:00');
});

it('has a retry until', function () {
    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $job = new FetchWalletNfts($wallet, $network);

    expect($job->retryUntil())->toBeInstanceOf(DateTime::class);
});

it('should paginate wallet NFTs', function () {
    Bus::fake();

    Alchemy::fake([
        '*' => Http::sequence()
            ->push(getTestNfts(2, 0, true))
            ->push(getTestNfts(1, 2)),
    ]);

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $this->assertDatabaseCount('nfts', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    expect(Nft::count())->toBe(2);

    Bus::assertDispatched(FetchWalletNfts::class, fn ($job) => $job->cursor === 'cursor');
});

function getTestNfts($length = 3, $offset = 0, $withCursor = false): array
{
    $nfts = [
        [
            'tokenId' => '1',
            'contract' => [
                'tokenType' => 'ERC721',
                'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                'deployedBlockNumber' => 10000,
                'totalSupply' => 10,
                'name' => 'tiny dinos',
                'symbol' => 'dino',
                'openSeaMetadata' => [
                    'floorPrice' => 0.0589,
                ],
            ],
        ],

        [
            'tokenId' => '2',
            'contract' => [
                'address' => '0x0053399124f0cbb46d2cbacd8a89cf0599974963',
                'tokenType' => 'ERC721',
                'deployedBlockNumber' => 10000,
                'totalSupply' => 10,
                'name' => 'tiny dinos', 'symbol' => 'dino',
                'openSeaMetadata' => [
                    'floorPrice' => 0.0589,
                ],
            ],
        ],

        [
            'tokenId' => '1',
            'contract' => [
                'address' => '0x2253399124f0cbb46d2cbacd8a89cf0599974963',
                'tokenType' => 'ERC721',
                'deployedBlockNumber' => 10000,
                'totalSupply' => 10,
                'name' => 'tiny dinos', 'symbol' => 'dino',
                'openSeaMetadata' => [
                    'floorPrice' => 0.0589,
                ],
            ],
        ],
    ];

    return [
        'ownedNfts' => array_slice($nfts, $offset, $length),
        'pageKey' => $withCursor ? 'cursor' : null,
    ];
}

it('should fetch nfts for wallet and keep previous collections last indexed token number', function () {
    Bus::fake();

    Alchemy::fake(Http::response(fixtureData('alchemy.nfts_for_owner_2'), 200));

    $network = Network::polygon();
    $wallet = Wallet::factory()->create();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'name' => 'PsychonautzNFT',
        'slug' => 'psychonautznft',
        'address' => '0x0b7600ca77fc257fe7eb432f87825cccc4590037',
        'last_indexed_token_number' => '12345',
    ]);

    $this->assertDatabaseCount('collections', 1);
    $this->assertDatabaseCount('nfts', 0);

    (new FetchWalletNfts($wallet, $network))->handle();

    $this->assertDatabaseCount('collections', 4);
    $this->assertDatabaseCount('nfts', 4);

    expect(Collection::whereNotNull('last_indexed_token_number')->count())->toBe(1);

    expect($collection->fresh()->last_indexed_token_number)->toBe('12345');
});
