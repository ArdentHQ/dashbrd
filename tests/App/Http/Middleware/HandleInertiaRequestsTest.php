<?php

declare(strict_types=1);

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Balance;
use App\Models\Collection;
use App\Models\Gallery;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
use App\Models\User;
use App\Models\Wallet;
use App\Support\Cache\UserCache;

it('should get cached data for user', function () {
    $user = User::factory()->create();
    $network = Network::polygon();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
    ]);

    $token = Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'MATIC',
    ]);

    Balance::factory()->create([
        'wallet_id' => $wallet->id,
        'token_id' => $token->id,
    ]);

    Nft::factory(4)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => Collection::factory()->create()->id,
    ]);

    Gallery::factory()->create(['user_id' => $user->id]);

    $user->wallet()->associate($wallet);
    $user->save();

    $wallet->refresh();
    $token->refresh();

    $userCache = new UserCache($user);

    $user->refresh();

    $request = request()->setUserResolver(fn () => $user);

    $middleware = new HandleInertiaRequests();

    $middlewareResponse = $middleware->share($request);

    expect($middlewareResponse['auth']()->wallet->nftCount)->toBe(4);
    expect($middlewareResponse['auth']()->wallet->collectionCount)->toBe(1);
    expect($middlewareResponse['auth']()->wallet->galleryCount)->toBe(1);
    expect(count($middlewareResponse['auth']()->wallet->nfts))->toBe(4);

    Nft::factory(4)->create([
        'wallet_id' => $wallet->id,
        'collection_id' => Collection::factory()->create()->id,
    ]);

    Gallery::factory()->create(['user_id' => $user->id]);

    $user->refresh();
    $wallet->refresh();
    $token->refresh();

    $middlewareResponse = $middleware->share($request);

    expect(($middlewareResponse['auth']())->wallet->nftCount)->toBe(4);
    expect($middlewareResponse['auth']()->wallet->collectionCount)->toBe(1);
    expect($middlewareResponse['auth']()->wallet->galleryCount)->toBe(1);
    expect(count($middlewareResponse['auth']()->wallet->nfts))->toBe(4);

    $userCache->clearUserDetailNfts();
    $userCache->clearNftsCount();
    $userCache->clearCollectionsCount();
    $userCache->clearGalleriesCount();

    $middlewareResponse = $middleware->share($request);

    expect($middlewareResponse['auth']()->wallet->nftCount)->toBe(8);
    expect($middlewareResponse['auth']()->wallet->collectionCount)->toBe(2);
    expect($middlewareResponse['auth']()->wallet->galleryCount)->toBe(2);
    expect(count($middlewareResponse['auth']()->wallet->nfts))->toBe(4);
});
