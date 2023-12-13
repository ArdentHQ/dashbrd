<?php

declare(strict_types=1);

namespace App\Http\Controllers\Traits;

use Illuminate\Http\Request;

trait HasCollectionFilters
{
    /**
     * @return object{chain?: string, sort?: string, period?: string}
     */
    private function getFilters(Request $request): object
    {
        $filter = [
            'chain' => $this->getValidValue($request->get('chain'), ['polygon', 'ethereum']),
            'sort' => $this->getValidValue($request->get('sort'), ['floor-price']),
            'period' => $this->getValidValue($request->get('period'), ['24h', '7d', '30d']),
            'query' => boolval($query = $request->get('query')) ? $query : null,
        ];

        // If value is not defined (or invalid), remove it from the array since
        // the frontend expect `undefined` values (not `null`)

        // Must be cast to an object due to some Inertia front-end stuff...
        return (object) array_filter($filter);
    }

    /**
     * @param  array<string>  $validValues
     */
    private function getValidValue(?string $value, array $validValues): ?string
    {
        return in_array($value, $validValues) ? $value : null;
    }
}
