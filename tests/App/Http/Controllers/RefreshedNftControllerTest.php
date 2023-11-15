<?php

declare(strict_types=1);

use App\Jobs\FetchCollectionActivity;
use App\Jobs\RefreshNftMetadata;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\SpamContract;
use Illuminate\Support\Facades\Bus;

it('can refresh metadata of nft', function () {
    Bus::fake();

    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

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

it('should not refresh if spam contract', function () {
    Bus::fake();

    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collection->id,
    ]);

    SpamContract::query()->create([
        'address' => $collection->address,
        'network_id' => $network->id,
    ]);

    $this->actingAs($user)
        ->post(route('nft.refresh', [$collection->slug, $nft->token_number]))
        ->assertStatus(200)
        ->assertJson([]);

    Bus::assertDispatchedTimes(RefreshNftMetadata::class, 0);
});

it('should not dispatch the job to refresh the activity if collection does not index activity', function () {
    Bus::fake();

    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'supply' => null,
    ]);

    $nft = Nft::factory()->create([
        'wallet_id' => $user->wallet_id,
        'collection_id' => $collection->id,
    ]);

    $this->actingAs($user)
        ->post(route('nft.refresh', [$collection->slug, $nft->token_number]))
        ->assertStatus(200);

    Bus::assertNotDispatched(FetchCollectionActivity::class);
});
