<?php

declare(strict_types=1);

namespace App\Enums;

use Illuminate\Support\Str;

enum CurrencyCode: string
{
    case USD = 'USD';
    case EUR = 'EUR';
    case AED = 'AED';
    case ARS = 'ARS';
    case AUD = 'AUD';
    case BDT = 'BDT';
    case BHD = 'BHD';
    case BMD = 'BMD';
    case BRL = 'BRL';
    case CAD = 'CAD';
    case CHF = 'CHF';
    case CLP = 'CLP';
    case CNY = 'CNY';
    case CZK = 'CZK';
    case DKK = 'DKK';
    case GBP = 'GBP';
    case HKD = 'HKD';
    case HUF = 'HUF';
    case IDR = 'IDR';
    case ILS = 'ILS';
    case INR = 'INR';
    case JPY = 'JPY';
    case KRW = 'KRW';
    case KWD = 'KWD';
    case LKR = 'LKR';
    case MMK = 'MMK';
    case MXN = 'MXN';
    case MYR = 'MYR';
    case NGN = 'NGN';
    case NOK = 'NOK';
    case NZD = 'NZD';
    case PHP = 'PHP';
    case PKR = 'PKR';
    case RUB = 'RUB';
    case PLN = 'PLN';
    case SAR = 'SAR';
    case SEK = 'SEK';
    case SGD = 'SGD';
    case THB = 'THB';
    case TRY = 'TRY';
    case TWD = 'TWD';
    case UAH = 'UAH';
    case VEF = 'VEF';
    case VND = 'VND';
    case ZAR = 'ZAR';

    /**
     * Returns the canonical internal string representation of the currency which
     * is different from what the end user sees in the UI.
     */
    public function canonical(): string
    {
        return Str::lower($this->value);
    }
}
