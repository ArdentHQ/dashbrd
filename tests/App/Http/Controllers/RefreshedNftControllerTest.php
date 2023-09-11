<?php

declare(strict_types=1);

use App\Jobs\RefreshNftMetadata;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use Illuminate\Support\Facades\Bus;

it('can refresh metadata of nft', function () {
    Bus::fake();

    $user = createUser();

    $network = Network::polygon()->firstOrFail();

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
