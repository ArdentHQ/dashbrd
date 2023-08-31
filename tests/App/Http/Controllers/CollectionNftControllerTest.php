<?php

declare(strict_types=1);

use App\Jobs\RefreshNftMetadata;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\NftActivity;
use App\Models\Token;
use Illuminate\Support\Facades\Bus;
use Inertia\Testing\AssertableInertia as Assert;

it('can render the collection nfts view page', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $token = Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'MATIC',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    /** @var Nft $nft */
    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collection->id,
    ]);

    $this->actingAs($user)
        ->get(route('collection-nfts.view', [$collection->slug, $nft->token_number]))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/Nfts/View')
            ->has('activities.paginated.data', 0)
            ->where('nativeToken.symbol', $token->symbol)
            ->whereNot('previousUrl', null)
        );
});

it('returns a null previous url if address is the same', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'MATIC',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    /** @var Nft $nft */
    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collection->id,
    ]);

    // Visit the page for the first time
    $this->actingAs($user)
        ->get(route('collection-nfts.view', [$collection->slug, $nft->token_number]));

    // Visit again so the previous url is the same
    $this->actingAs($user)
        ->get(route('collection-nfts.view', [$collection->slug, $nft->token_number]))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/Nfts/View')
            ->where('previousUrl', null)
        );
});

it('should render the collections NTFs view page with custom pageLimit', function () {
    $user = createUser();

    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $token = Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'MATIC',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $nft = Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    NftActivity::factory()->count(12)->create([
        'nft_id' => $nft->id,
    ]);

    $this->actingAs($user)
        ->get(route('collection-nfts.view', [
            'collection' => $collection->slug,
            'nft' => $nft->token_number,
            'tab' => 'activity',
            'pageLimit' => 25,
        ]))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Collections/Nfts/View')
            ->has('activities.paginated.data', 12)
            ->where('nativeToken.symbol', $token->symbol)
        );
});

it('can refresh metadata of nft', function () {
    Bus::fake();

    $user = createUser();

    $network = Network::polygon()->firstOrFail();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    /** @var Nft $nft */
    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collection->id,
    ]);

    $this->actingAs($user)
        ->post(route('nft.refresh', [$collection->slug, $nft->token_number]))
        ->assertStatus(200)
        ->assertJson(['success' => true]);

    Bus::assertDispatchedTimes(RefreshNftMetadata::class, 1);
});
