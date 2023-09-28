<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $title ?? config('app.name', 'Laravel') }}</title>

        {{-- Metatags Socials --}}
        <meta name="title" content="{{ $title ?? trans('metatags.home.title') }}" />
        <meta name="description" content="{{ $description ?? trans('metatags.home.description') }}" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="{{ $title ?? trans('metatags.home.title') }}" />
        <meta property="og:description" content="{{ $description ?? trans('metatags.home.description') }}" />
        <meta property="og:image" content="{{ url($image ?? trans('metatags.home.image')) }}" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="{{ $title ?? trans('metatags.home.title') }}" />
        <meta property="twitter:description" content="{{ $description ?? trans('metatags.home.description') }}" />
        <meta property="twitter:image" content="{{ url($image ?? trans('metatags.home.image')) }}" />

        {{-- Metadata --}}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5060ee">
        <meta name="msapplication-TileColor" content="#5060ee">
        <meta name="theme-color" content="#ffffff">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="w-full font-sans antialiased transition-default dark:bg-theme-dark-900">
        @inertia

        @if (config('services.google_analytics.tracking_code'))
            @if(! \App\Support\Visitor::isEuropean(request()))
                <!-- Google tag (gtag.js) -->
                <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.google_analytics.tracking_code') }}"></script>
                <script>
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', '{{ config('services.google_analytics.tracking_code') }}');
                </script>
            @else
                <script>
                    document.addEventListener('DOMContentLoaded', function () {
                        CookieConsent({
                            cookieConsentCode: '{{ config('services.google_analytics.tracking_code') }}',
                            contactEmail: '{{ config('dashbrd.contact_email') }}',
                            cookiePolicyUrl: '{{ trans('urls.cookie_policy') }}',
                        })
                    });
                </script>
            @endif
        @endif
    </body>
</html>
