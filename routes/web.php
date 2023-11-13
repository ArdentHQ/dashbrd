<?php

declare(strict_types=1);

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\CollectionReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Filament\LogoutController;
use App\Http\Controllers\FilteredGalleryController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\GalleryReportController;
use App\Http\Controllers\GeneralSettingsController;
use App\Http\Controllers\HiddenCollectionController;
use App\Http\Controllers\MetaImageController;
use App\Http\Controllers\MyGalleryCollectionController;
use App\Http\Controllers\MyGalleryController;
use App\Http\Controllers\NftController;
use App\Http\Controllers\NftReportController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\RefreshCsrfTokenController;
use App\Http\Controllers\WalletController;
use App\Http\Middleware\EnsureOnboarded;
use App\Http\Middleware\RecordGalleryView;
use Illuminate\Support\Facades\Route;

Route::get('/', [GalleryController::class, 'index'])->name('galleries');

Route::get('/wallet', DashboardController::class)->name('dashboard');

Route::get('csrf-token', RefreshCsrfTokenController::class)->name('refresh-csrf-token');

Route::middleware('auth')->group(function () {
    Route::get('/get-started', [OnboardingController::class, 'show'])->name('onboarding');
    Route::get('/wallet-data', WalletController::class)->name('wallet');

    // Settings
    Route::get('/settings', [GeneralSettingsController::class, 'edit'])->name('settings.general');

    Route::group(['middleware' => 'signed_wallet'], function () {
        Route::put('/settings', [GeneralSettingsController::class, 'update'])->middleware('signed_wallet');
    });

    // Gallery
    Route::group(['prefix' => 'my-galleries', 'middleware' => 'features:galleries'], function () {
        Route::get('', [MyGalleryController::class, 'index'])->name('my-galleries')->middleware(EnsureOnboarded::class);

        Route::get('create', [MyGalleryController::class, 'create'])->name('my-galleries.create')->middleware(EnsureOnboarded::class);

        Route::group(['middleware' => 'signed_wallet'], function () {
            Route::post('create', [MyGalleryController::class, 'store'])->name('my-galleries.store')->middleware(EnsureOnboarded::class);
            Route::delete('{gallery:slug}', [MyGalleryController::class, 'destroy'])->name('my-galleries.destroy');
        });

        Route::get('{gallery:slug}/edit', [MyGalleryController::class, 'edit'])->name('my-galleries.edit');

        Route::get('collections', [MyGalleryCollectionController::class, 'index'])->name('my-galleries.collections');
        Route::get('{collection:slug}/nfts', [MyGalleryCollectionController::class, 'nfts'])->name('my-galleries.nfts');
    });

    Route::group(['prefix' => 'collections', 'middleware' => ['features:collections', 'signed_wallet']], function () {
        Route::post('{collection:address}/hidden',
            [HiddenCollectionController::class, 'store'])->name('hidden-collections.store');
        Route::delete('{collection:address}/hidden',
            [HiddenCollectionController::class, 'destroy'])->name('hidden-collections.destroy');
        Route::post('{collection:address}/reports', [
            CollectionReportController::class, 'store',
        ])->name('collection-reports.create')->middleware('throttle:collection:reports');
    });

    Route::group(['prefix' => 'nfts', 'middleware' => 'signed_wallet'], function () {
        Route::post('{nft:id}/reports', [NftReportController::class, 'store'])->name('nft-reports.create')->middleware('throttle:nft:reports');
    });

    Route::group(['prefix' => 'galleries', 'middleware' => ['features:galleries', 'signed_wallet']], function () {

        Route::post('{gallery:slug}/reports',
            [GalleryReportController::class, 'store'])
                ->name('reports.create')
                ->middleware('throttle:gallery:reports');
    });
});

Route::group(['prefix' => 'articles', 'middleware' => 'features:articles'], function () {
    Route::get('', [ArticleController::class, 'index'])->name('articles');
    Route::get('{article:slug}', [ArticleController::class, 'show'])->name('articles.view');
});

Route::group(['prefix' => 'collections', 'middleware' => 'features:collections'], function () {
    Route::get('', [CollectionController::class, 'index'])->name('collections')->middleware(EnsureOnboarded::class);
    Route::get('{collection:slug}', [CollectionController::class, 'show'])->name('collections.view');
    Route::get('{collection:slug}/articles', [CollectionController::class, 'articles'])->name('collections.articles');
    Route::get('{collection:slug}/{nft:token_number}', [NftController::class, 'show'])->name('collection-nfts.view');
});

Route::group(['prefix' => 'galleries', 'middleware' => 'features:galleries'], function () {
    Route::redirect('/', '/'); // due to the prefix it's hard to see, but it redirects from /galleries to /

    Route::get('{filter}', [FilteredGalleryController::class, 'index'])
            ->name('filtered-galleries.index')
            ->whereIn('filter', ['most-popular', 'most-valuable', 'newest']);

    Route::get('{gallery:slug}', [GalleryController::class, 'show'])
            ->middleware(RecordGalleryView::class)
            ->name('galleries.view');

    Route::get('{gallery:slug}/meta-image.png', MetaImageController::class)->name('galleries.meta-image');
});

Route::post('/auth/logout', [LogoutController::class, 'logout'])->name('filament.admin.auth.logout');

require __DIR__.'/auth.php';
