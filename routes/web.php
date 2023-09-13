<?php

declare(strict_types=1);

use App\Http\Controllers\CollectionController;
use App\Http\Controllers\CollectionReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\GalleryFiltersController;
use App\Http\Controllers\GalleryReportController;
use App\Http\Controllers\GeneralSettingsController;
use App\Http\Controllers\HiddenCollectionController;
use App\Http\Controllers\MyGalleryCollectionController;
use App\Http\Controllers\MyGalleryController;
use App\Http\Controllers\NftController;
use App\Http\Controllers\NftReportController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\RefreshCsrfTokenController;
use App\Http\Middleware\EnsureOnboarded;
use App\Http\Middleware\RecordGalleryView;
use Illuminate\Support\Facades\Route;

Route::get('/', [GalleryController::class, 'index'])->name('galleries');

Route::get('/wallet', DashboardController::class)->name('dashboard');

Route::get('csrf-token', RefreshCsrfTokenController::class)->name('refresh-csrf-token');

Route::middleware('auth')->group(function () {
    Route::get('/get-started', [OnboardingController::class, 'show'])->name('onboarding');

    // Settings
    Route::get('/settings', [GeneralSettingsController::class, 'edit'])->name('settings.general');
    Route::put('/settings', [GeneralSettingsController::class, 'update']);

    // Gallery
    Route::group(['prefix' => 'my-galleries', 'middleware' => 'features:galleries'], function () {
        Route::get('', [MyGalleryController::class, 'index'])->name('my-galleries')->middleware(EnsureOnboarded::class);

        Route::group(['middleware' => 'signed_wallet'], function () {
            Route::get('create', [MyGalleryController::class, 'create'])->name('my-galleries.create')->middleware(EnsureOnboarded::class);
            Route::post('create', [MyGalleryController::class, 'store'])->name('my-galleries.store')->middleware(EnsureOnboarded::class);
            Route::get('{gallery:slug}/edit', [MyGalleryController::class, 'edit'])->name('my-galleries.edit');
            Route::delete('{gallery:slug}', [MyGalleryController::class, 'destroy'])->name('my-galleries.destroy');
        });

        Route::get('collections', [MyGalleryCollectionController::class, 'index'])->name('my-galleries.collections');
        Route::get('{collection:slug}/nfts', [MyGalleryCollectionController::class, 'nfts'])->name('my-galleries.nfts');
    });

    Route::group(['prefix' => 'collections', 'middleware' => 'features:collections'], function () {
        Route::post('{collection:address}/hidden',
            [HiddenCollectionController::class, 'store'])->name('hidden-collections.store');
        Route::delete('{collection:address}/hidden',
            [HiddenCollectionController::class, 'destroy'])->name('hidden-collections.destroy');
        Route::post('{collection:address}/reports', [
            CollectionReportController::class, 'store',
        ])->name('collection-reports.create')->middleware('throttle:collection:reports');
    });

    Route::group(['prefix' => 'nfts'], function () {
        Route::post('{nft:id}/reports', [NftReportController::class, 'store'])->name('nft-reports.create')->middleware('throttle:nft:reports');
    });

    Route::group(['prefix' => 'galleries', 'middleware' => 'features:galleries'], function () {

        Route::post('{gallery:slug}/reports',
            [GalleryReportController::class, 'store'])
                ->name('reports.create')
                ->middleware(['throttle:gallery:reports', 'signed_wallet']);
    });
});

Route::group(['prefix' => 'collections', 'middleware' => 'features:collections'], function () {
    Route::get('', [CollectionController::class, 'index'])->name('collections')->middleware(EnsureOnboarded::class);
    Route::get('{collection:slug}', [CollectionController::class, 'view'])->name('collections.view');
    Route::get('{collection:slug}/{nft:token_number}', [NftController::class, 'show'])->name('collection-nfts.view');
});

Route::group(['prefix' => 'galleries', 'middleware' => 'features:galleries'], function () {
    Route::redirect('/', '/'); // due to the prefix it's hard to see, but it redirects from /galleries to /
    Route::get('galleries', [GalleryController::class, 'galleries'])->name('galleries.galleries');
    Route::get('most-popular', [GalleryFiltersController::class, 'index'])->name('galleries.most-popular');
    Route::get('most-valuable', [GalleryFiltersController::class, 'index'])->name('galleries.most-valuable');
    Route::get('newest', [GalleryFiltersController::class, 'index'])->name('galleries.newest');

    Route::get('{gallery:slug}', [GalleryController::class, 'view'])
        ->middleware(RecordGalleryView::class)
        ->name('galleries.view');
});

require __DIR__.'/auth.php';
