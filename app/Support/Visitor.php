<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\Request;

class Visitor
{
    public static function isEuropean(Request $request): bool
    {
        /** @var string */
        $countryCode = $request->header('cf-ipcountry', 'AT');

        return in_array(strtoupper($countryCode), [
            'AD',
            'AI',
            'AT',
            'AW',
            'AX',
            'BE',
            'BG',
            'BL',
            'BM',
            'CH',
            'CW',
            'CY',
            'CZ',
            'DE',
            'DK',
            'EE',
            'ES',
            'FI',
            'FK',
            'FR',
            'GB',
            'GF',
            'GG',
            'GI',
            'GI',
            'GL',
            'GP',
            'GR',
            'GS',
            'HR',
            'HU',
            'IE',
            'IO',
            'IT',
            'JE',
            'KY',
            'LI',
            'LT',
            'LU',
            'LV',
            'MC',
            'ME',
            'MF',
            'MQ',
            'MS',
            'MT',
            'NC',
            'NL',
            'PF',
            'PL',
            'PM',
            'PN',
            'PT',
            'RE',
            'RO',
            'SE',
            'SH',
            'SI',
            'SK',
            'SM',
            'SX',
            'TC',
            'TF',
            'VA',
            'VG',
            'WF',
            'YT',
        ], strict: true);
    }
}
