<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Gallery;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordGalleryView
{
    /**
     * @param  \Closure(Request):Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $gallery = $request->route('gallery');

        if (! $gallery instanceof Gallery) {
            $gallery = (new Gallery)->resolveRouteBinding($gallery);
        }

        if ($gallery instanceof Gallery) {
            views($gallery)->cooldown(
                now()->addHour()
            )->record();
        }

        return $next($request);
    }
}
