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

        // @codeCoverageIgnoreEnd

        return Blade::render($contents, $params);
    }
}

// @codeCoverageIgnoreStart
if (! function_exists('isBase64EncodedImage')) {
    // @codeCoverageIgnoreEnd

    function isBase64EncodedImage(string $string): bool
    {
        return str_starts_with($string, 'data:image');
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

// @codeCoverageIgnoreStart
if (! function_exists('format_amount_for_display')) {
    // @codeCoverageIgnoreEnd

    function format_amount_for_display(int $number): string
    {
        if ($number >= 1000000) {
            return number_format($number / 1000000, 1).'m';
        }

        if ($number >= 1000) {
            return number_format($number / 1000, 1).'k';
        }

        return (string) $number;
    }
}
