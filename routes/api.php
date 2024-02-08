<?php

declare(strict_types=1);

use App\Http\Controllers;
use App\Http\Controllers\Api;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::get('/landing-data', Controllers\LandingPageDataController::class)->name('landing-data');

Route::get('/galleries-overview', [Api\GalleryOverviewController::class, 'index'])
        ->name('galleries-overview.index');

Route::get('/nominatable-collections', [Api\NominatableCollectionController::class, 'index'])
        ->name('nominatable-collections');

Route::get('/popular-collections', [Api\PopularCollectionController::class, 'index'])
        ->name('api:popular-collections');

Route::get('/votable-collections', [Api\VotableCollectionController::class, 'index'])
        ->name('api:votable-collections');

Route::get('/all-popular-collections', [Api\AllPopularCollectionController::class, 'index'])
        ->name('api:all-popular-collections');

Route::middleware('auth:sanctum')->group(function () {
    // Tokens...
    Route::get('/tokens', [Controllers\TokenController::class, 'list'])->name('tokens.list');
    Route::get('/tokens/breakdown', [Controllers\TokenController::class, 'breakdown'])->name('tokens.breakdown');
    Route::get('/tokens/search', [Controllers\TokenController::class, 'searchTokens'])->name('tokens.search');

    Route::post('/refreshed-collections', [Controllers\RefreshedCollectionController::class, 'store'])->name('refresh-collections');

    Route::post('/transaction-success', Controllers\TransactionSuccessController::class)
            ->name('transaction-success');

    Route::get('/networks/{network:id}/tokens/{token:address}/transactions/network-native-token', [Controllers\NativeTokenController::class, 'show'])
            ->name('tokens.network-native-token')
            ->scopeBindings();

    Route::post('/price_history', Controllers\PriceHistoryController::class)
            ->name('price_history');

    Route::post('/line_chart_data', Controllers\WalletsLineChartController::class)
            ->name('line_chart_data');

    Route::post('/galleries/{gallery:slug}/like', [Api\LikedGalleryController::class, 'store'])
            ->name('galleries.like')
            ->middleware('signed_wallet');

    Route::get('/user/nfts', Api\UserNftController::class)->name('user.nfts');

    Route::post('/collections/{collection:slug}/{nft:token_number}/refresh', Controllers\RefreshedNftController::class)
            ->name('nft.refresh')
            ->middleware('throttle:nft:refresh');

    Route::post('/collections/{collection:slug}/refresh', [Controllers\CollectionController::class, 'refreshActivity'])
            ->name('collection.refresh-activity');

    Route::get('/networks/{chainId}', Controllers\NetworkController::class)
            ->name('network-by-chain');
});
