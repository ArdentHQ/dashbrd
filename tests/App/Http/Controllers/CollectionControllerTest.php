<?php

declare(strict_types=1);

use App\Enums\CurrencyCode;
use App\Enums\TraitDisplayType;
use App\Jobs\FetchCollectionActivity;
use App\Jobs\FetchCollectionBanner;
use App\Jobs\SyncCollection;
use App\Models\Article;
use App\Models\Collection;
use App\Models\Network;
use App\Models\Nft;
use App\Models\Token;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

it('can render the collections overview page', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get(route('collections'))
        ->assertStatus(200);
});

it('can return featured collections', function() {
    $user = createUser();

    Collection::factory(8)->create([
        'is_featured' => false,
    ]);

    Collection::factory(2)->create([
        'is_featured' => true,
    ]);

    $this->actingAs($user)
        ->get(route('collections'))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/Index')
                ->has(
                    'featuredCollections'
                ),
            fn (Assert $page) =>
                $page->where('featuredCollections', 2)

        );
});

it('can cache 3 random nfts from a featured collection', function() {
    $user = createUser();

    $collection = Collection::factory()->create([
        'is_featured' => true,
    ]);

    $nfts = Nft::factory(10)->create([
        'collection_id' => $collection->id,
    ]);

    $this->actingAs($user)
        ->get(route('collections'))
        ->assertStatus(200);

    $cachedNfts = Cache::get('featuredNftsForCollection' . $collection->id);

    expect(count($cachedNfts))->toEqual(3);
});

it('can render the collections view page', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => null,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    expect($collection->fresh()->last_viewed_at)->not->toBeNull();

    Bus::assertDispatched(SyncCollection::class);
});

it('should run FetchCollectionBanner if collection has no banner', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => null,
        ],
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    Bus::assertDispatched(FetchCollectionBanner::class);
});

it('should run FetchCollectionBanner if colleciton banner was updated more than a week ago', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
            'banner_updated_at' => now()->subWeek()->subDay()->toDateTimeString(),
        ],
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    Bus::assertDispatched(FetchCollectionBanner::class);
});

it('should run FetchCollectionBanner if collection has banner but no banner_updated_at set', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
        ],
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    Bus::assertDispatched(FetchCollectionBanner::class);
});

it('should not run FetchCollectionBanner if collection has banner and banner_updated_at set', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'extra_attributes' => [
            'banner' => 'https://example.com/image.png',
            'banner_updated_at' => Carbon::now(),
        ],
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    Bus::assertNotDispatched(FetchCollectionBanner::class);
});

it('can render the collection details page for guests', function () {
    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => null,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->get(route('collections.view', $collection->slug))
        ->assertStatus(200);
});

it('does not dispatch the job to sync collection if it has been recently viewed', function () {
    $user = createUser();

    $network = Network::polygon();

    Bus::fake();

    $now = now()->subMinutes(5);

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => $now,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', $collection->slug))
        ->assertStatus(200);

    // Time is newer than $now..
    expect($collection->fresh()->last_viewed_at->gte($now))->toBeTrue();

    Bus::assertNotDispatched(SyncCollection::class);
});

it('can render the collections view page with owned filter', function ($owned) {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'owned' => $owned,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', $owned !== null)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
})->with([
    null,
    true,
    1,
]);

it('can render the collections view page with falsy owned filter', function ($owned) {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Nft::factory()->create([
        'collection_id' => $collection->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'owned' => $owned,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
})->with([
    false,
    0,
]);

it('can render the collections view page with custom nftPageLimit', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'nftPageLimit' => 48,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('tab', 'collection')
                        ->where('traits', null)
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 48)
                )
        );
});

it('can render the collections view page with traits', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $traits = [
        'Background' => [
            ['value' => 'Red', 'displayType' => TraitDisplayType::Property->value],
            ['value' => 'Blue', 'displayType' => TraitDisplayType::Property->value],
        ],
        'Body' => [
            ['value' => 'Brown', 'displayType' => TraitDisplayType::Property->value],
            ['value' => 'Blue', 'displayType' => TraitDisplayType::Property->value],
        ],
    ];

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'traits' => $traits,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', $traits)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('can render the collections view page with activity tab', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'tab' => 'activity',
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('tab', 'activity')
                        ->where('traits', null)
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('can render the collections view page with custom activityPageLimit', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'tab' => 'activity',
            'activityPageLimit' => 25,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('tab', 'activity')
                        ->where('traits', null)
                        ->where('activityPageLimit', 25)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('can render the collections view page with max activityPageLimit of 100', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'tab' => 'activity',
            'activityPageLimit' => 300,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('tab', 'activity')
                        ->where('traits', null)
                        ->where('activityPageLimit', 100)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('uses collection tab if another parameter is passed', function () {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'tab' => 'other',
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('can render the collections view page with invalid traits', function ($invalidTraits) {
    $user = createUser();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'traits' => $invalidTraits,
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
})->with([
    // Invalid boolean
    true,
    // Invalid array format
    [
        'Background' => 'Red',
        'Body' => 'Brown',
    ],
    [
        'Background' => ['value' => 'Red', 'displayType' => 'asdf'],
    ],
    [
        1 => ['value' => 'Red', 'displayType' => TraitDisplayType::Property->value],
    ],
    null,
]);

it('can render the collections view page with empty traits', function () {
    $user = createUser();
    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('collections.view', [
            'collection' => $collection->slug,
            'traits' => [],
        ]))
        ->assertStatus(200)
        ->assertInertia(
            fn (Assert $page) => $page
                ->component('Collections/View')
                ->has(
                    'appliedFilters',
                    fn (Assert $page) => $page->where('owned', false)
                        ->where('traits', null)
                        ->where('tab', 'collection')
                        ->where('activityPageLimit', 10)
                        ->where('nftPageLimit', 24)
                )
        );
});

it('should return collection articles', function () {
    $collections = Collection::factory(8)->create();

    $articles = Article::factory(2)->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $articles->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection()
    );

    $collections->map(function ($collection) use ($articles) {
        $collection->articles()->attach($articles, ['order_index' => 1]);
    });

    $collection = $collections->first();

    $response = $this->getJson(route('collections.articles', $collection))->json('articles');

    expect(count($response['paginated']['data']))->toEqual(2)
        ->and(count($response['paginated']['data'][0]['featuredCollections']))->toEqual(8);
});

it('should return collection articles with the given pageLimit', function ($pageLimit, $resultCount) {
    $collections = Collection::factory(2)->create();

    $articles = Article::factory(35)->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $articles->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection()
    );

    $collections->map(function ($collection) use ($articles) {
        $collection->articles()->attach($articles, ['order_index' => 1]);
    });

    $response = $this->getJson(route('collections.articles', [
        'collection' => $collections->first(),
        'pageLimit' => $pageLimit,
    ]))->json('articles');

    expect(count($response['paginated']['data']))->toEqual($resultCount);
})->with([
    [123, 35],
    [12, 12],
    [24, 24],
]);
it('should return published collection articles', function () {
    $collection = Collection::factory()->create();

    $articles = Article::factory(3)->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $unpublishedArticle = Article::factory()->create([
        'published_at' => null,
    ]);

    $articles->push($unpublishedArticle);

    attachImageToArticles($articles);

    $collection->articles()->attach($articles, ['order_index' => 1]);

    $response = $this->getJson(route('collections.articles', $collection))->json('articles');

    expect(count($response['paginated']['data']))->toEqual(3)
        ->and(array_column($response['paginated']['data'], 'id'))->not()->toContain($unpublishedArticle->id);
});

it('should get collection articles sorted: popularity', function () {
    $collection = Collection::factory()->create();

    $article1 = Article::factory()->create([
        'published_at' => now()->format('Y-m-d'),
        'views_count_7days' => 1,
    ]);

    $article2 = Article::factory()->create([
        'published_at' => now()->format('Y-m-d'),
        'views_count_7days' => 3,
    ]);

    $collection->articles()->attach($article1, ['order_index' => 1]);
    $collection->articles()->attach($article2, ['order_index' => 1]);

    attachImageToArticles(collect([$article2, $article1]));

    $response = $this->getJson(
        route('collections.articles', [
            'collection' => $collection,
            'sort' => 'popularity',
        ])
    )->json('articles');

    $returnedArticles = $response['paginated']['data'];

    expect($returnedArticles[0]['id'])->toBe($article2->id)
        ->and($returnedArticles[1]['id'])->toBe($article1->id);
});

it('should get collection articles sorted: latest', function () {
    $collection = Collection::factory()->create();

    $article1 = Article::factory()->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $article2 = Article::factory()->create([
        'published_at' => now()->format('Y-m-d'),
    ]);

    $collection->articles()->attach($article1, ['order_index' => 1]);
    $collection->articles()->attach($article2, ['order_index' => 1]);

    attachImageToArticles(collect([$article2, $article1]));

    $response = $this->getJson(route('collections.articles', $collection))->json('articles');

    $returnedArticles = $response['paginated']['data'];

    expect($returnedArticles[0]['id'])->toBe($article2->id)
        ->and($returnedArticles[1]['id'])->toBe($article1->id);
});

function attachImageToArticles($articles)
{
    $articles->map(fn ($article) => $article
        ->addMedia('database/seeders/fixtures/articles/images/discovery-of-the-day-luchadores.png')
        ->preservingOriginal()
        ->toMediaCollection()
    );
}
it('can refresh collection activity', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => null,
        'supply' => null,
        'activity_updated_at' => null,
        'is_fetching_activity' => false,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
         ->post(route('collection.refresh-activity', [
             'collection' => $collection->slug,
         ]))
        ->assertStatus(200);

    Bus::assertDispatched(FetchCollectionActivity::class);
});

it('should refresh collection activity with delay if recently requested', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => null,
        'supply' => null,
        'activity_updated_at' => Carbon::now()->addHours(-5),
        'is_fetching_activity' => false,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
         ->post(route('collection.refresh-activity', [
             'collection' => $collection->slug,
         ]))
        ->assertStatus(200);

    Bus::assertDispatched(FetchCollectionActivity::class);
});

it('should not refresh collection activity if already requested', function () {
    $user = createUser();

    Bus::fake();

    $network = Network::polygon();

    $collection = Collection::factory()->create([
        'network_id' => $network->id,
        'last_viewed_at' => null,
        'supply' => null,
        'activity_updated_at' => Carbon::now(),
        'activity_update_requested_at' => Carbon::now()->addHours(-1),
        'is_fetching_activity' => false,
    ]);

    Token::factory()->create([
        'network_id' => $network->id,
        'symbol' => 'ETH',
        'is_native_token' => 1,
        'is_default_token' => 1,
    ]);

    $this->actingAs($user)
         ->post(route('collection.refresh-activity', [
             'collection' => $collection->slug,
         ]))
        ->assertStatus(200);

    Bus::assertNotDispatched(FetchCollectionActivity::class);
});
