<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;

// @codeCoverageIgnoreStart
if (! function_exists('get_query')) {
    // @codeCoverageIgnoreEnd
    /**
     * @param  array<string, mixed>  $params
     */
    function get_query(string $name, array $params = []): string
    {
        $contents = file_get_contents(base_path('queries/'.$name.'.sql'));

        // @codeCoverageIgnoreStart
        if ($contents === false) {
            throw new Exception(sprintf('Cannot read file: %s', $name));
        }

        if (count($params) === 0) {
            return $contents;
        }

        // @codeCoverageIgnoreEnd

        return Blade::render($contents, $params);
    }
}

// @codeCoverageIgnoreStart
if (! function_exists('filterAttributes')) {
    // @codeCoverageIgnoreEnd

    /**
     * @param  array<mixed>  $data
     * @param  array<mixed>  $attributes
     * @return array<mixed>
     */
    function filterAttributes($data, $attributes): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value) && isset($attributes[$key])) {
                if (is_array($attributes[$key])) {
                    $data[$key] = filterAttributes($data[$key], $attributes[$key]);
                }
            } elseif (! in_array($key, $attributes)) {
                unset($data[$key]);
            }
        }

        return $data;
    }
}
