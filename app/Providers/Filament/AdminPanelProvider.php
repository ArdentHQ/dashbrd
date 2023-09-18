<?php

declare(strict_types=1);

namespace App\Providers\Filament;

use Filament\FontProviders\GoogleFontProvider;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Jeffgreco13\FilamentBreezy\BreezyCore;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->authGuard('admin')
            ->login()
            ->font('Ubuntu', provider: GoogleFontProvider::class)
            ->viteTheme("resources/css/filament/admin/theme.css")
            ->favicon(asset('favicon-32x32.png'))
            ->colors([
                'primary' => [
                    50 => '248, 248, 255',
                    100 => '229, 232, 255',
                    200 => '207, 212, 255',
                    300 => '168, 177, 255',
                    400 => '134, 146, 255',
                    500 => '107, 122, 255',
                    600 => '80, 96, 238',
                    700 => '61, 76, 211',
                    800 => '44, 57, 174',
                    900 => '33, 43, 131',
                    950 => '33, 43, 131',
                ],
                'gray' => [
                    50 => '250, 250, 255',
                    100 => '246, 247, 255',
                    200 => '236, 237, 249',
                    300 => '226, 227, 241',
                    400 => '209, 211, 227',
                    500 => '178, 181, 204',
                    600 => '144, 147, 172',
                    700 => '114, 118, 142',
                    800 => '73, 76, 94',
                    900 => '49, 51, 63',
                    950 => '49, 51, 63',
                ],
                'danger' => [
                    50 => '255, 245, 242',
                    100 => '255, 224, 218',
                    200 => '254, 184, 174',
                    300 => '239, 124, 109',
                    400 => '222, 88, 70',
                    500 => '201, 41, 44',
                    600 => '176, 30, 32',
                    700 => '136, 26, 27',
                    800 => '91, 27, 27',
                    900 => '57, 25, 25',
                    950 => '57, 25, 25',
                ],
                'info' => [
                    50 => '245, 250, 255',
                    100 => '229, 240, 248',
                    200 => '186, 214, 240',
                    300 => '153, 199, 238',
                    400 => '119, 185, 254',
                    500 => '62, 157, 255',
                    600 => '0, 125, 255',
                    700 => '7, 90, 242',
                    800 => '11, 77, 199',
                    900 => '23, 62, 133',
                    950 => '23, 62, 133',
                ],
                'success' => [
                    50 => '240, 253, 244',
                    100 => '226, 240, 230',
                    200 => '176, 219, 188',
                    300 => '140, 198, 157',
                    400 => '96, 192, 124',
                    500 => '66, 178, 99',
                    600 => '40, 149, 72',
                    700 => '48, 120, 69',
                    800 => '43, 79, 53',
                    900 => '38, 55, 43',
                    950 => '38, 55, 43',
                ],
                'warning' => [
                    50 => '255, 248, 235',
                    100 => '255, 230, 184',
                    200 => '255, 212, 134',
                    300 => '255, 195, 89',
                    400 => '254, 185, 51',
                    500 => '255, 174, 16',
                    600 => '252, 159, 15',
                    700 => '248, 142, 13',
                    800 => '242, 124, 11',
                    900 => '236, 92, 8',
                    950 => '236, 92, 8',
                ],
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])
            ->plugins([
                BreezyCore::make()
                    // See https://github.com/jeffgreco13/filament-breezy
                    ->myProfile(
                        shouldRegisterUserMenu: true,
                        shouldRegisterNavigation: false,
                        hasAvatars: false,
                        slug: 'my-profile',
                    )
                    ->enableTwoFactorAuthentication(
                        force: config('filament.2fa_enabled'),
                    ),
            ]);
    }
}
