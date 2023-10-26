<?php

declare(strict_types=1);

use App\Http\Controllers;
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

Route::middleware('auth:sanctum')->group(function () {
    // Tokens...
    Route::get('/tokens', [Controllers\TokenController::class, 'list'])->name('tokens.list');
    Route::get('/tokens/breakdown', [Controllers\TokenController::class, 'breakdown'])->name('tokens.breakdown');
    Route::get('/tokens/search', [Controllers\TokenController::class, 'searchTokens'])->name('tokens.search');

    Route::post('/refreshed-collections', [Controllers\RefreshedCollectionController::class, 'store'])
            ->name('refresh-collections')
            ->middleware('signed_wallet');

    Route::post('/transaction-success', Controllers\TransactionSuccessController::class)
            ->name('transaction-success');

    Route::get('/networks/{network:id}/tokens/{token:address}/transactions/network-native-token', [Controllers\NativeTokenController::class, 'show'])
            ->name('tokens.network-native-token')
            ->scopeBindings();

    Route::post('/price_history', Controllers\PriceHistoryController::class)
            ->name('price_history');

    Route::post('/line_chart_data', Controllers\WalletsLineChartController::class)
            ->name('line_chart_data');

    Route::post('/galleries/{gallery:slug}/like', [Controllers\GalleryController::class, 'like'])
        ->name('galleries.like')
        ->middleware(['signed_wallet']);

    Route::post('/collections/{collection:slug}/{nft:token_number}/refresh', Controllers\RefreshedNftController::class)
            ->name('nft.refresh')
            ->middleware('throttle:nft:refresh');

    Route::get('/networks/{chainId}', Controllers\NetworkController::class)
            ->name('network-by-chain');
});
