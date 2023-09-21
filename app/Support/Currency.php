<?php

declare(strict_types=1);

namespace App\Support;

use App\Enums\CurrencyCode;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Collection;

/**
 * @implements Arrayable<'name'|'code'|'symbol', string>
 */
class Currency implements Arrayable
{
    public function __construct(
        public readonly string $name,
        public readonly string $code,
        public readonly string $symbol,
    ) {
    }

    public static function find(?string $currency, string $default = 'UTC'): string
    {
        return static::codes()->contains($currency)
                    ? $currency
                    : $default;
    }

    /**
     * @return Collection<int, string>
     */
    public static function codes(): Collection
    {
        return static::all()->pluck('code');
    }

    /**
     * @return Collection<int, self>
     */
    public static function all(): Collection
    {
        return collect([
            new self(name: 'US Dollar', code: CurrencyCode::USD->value, symbol: '$'),
            new self(name: 'Euro', code: CurrencyCode::EUR->value, symbol: '€'),
            new self(name: 'United Arab Emirates Dirham', code: CurrencyCode::AED->value, symbol: 'إ.د'),
            new self(name: 'Argentine Peso', code: CurrencyCode::ARS->value, symbol: '$'),
            new self(name: 'Australian Dollar', code: CurrencyCode::AUD->value, symbol: '$'),
            new self(name: 'Bangladeshi Taka', code: CurrencyCode::BDT->value, symbol: '৳'),
            new self(name: 'Bahraini Dinar', code: CurrencyCode::BHD->value, symbol: '.د.ب'),
            new self(name: 'Bermudan Dollar', code: CurrencyCode::BMD->value, symbol: '$'),
            new self(name: 'Brazilian Real', code: CurrencyCode::BRL->value, symbol: 'R$'),
            new self(name: 'Canadian Dollar', code: CurrencyCode::CAD->value, symbol: '$'),
            new self(name: 'Swiss Franc', code: CurrencyCode::CHF->value, symbol: 'CHf'),
            new self(name: 'Chilean Peso', code: CurrencyCode::CLP->value, symbol: '$'),
            new self(name: 'Chinese Yuan', code: CurrencyCode::CNY->value, symbol: '¥'),
            new self(name: 'Czech Republic Koruna', code: CurrencyCode::CZK->value, symbol: 'Kč'),
            new self(name: 'Danish Krone', code: CurrencyCode::DKK->value, symbol: 'Kr.'),
            new self(name: 'British Pound Sterling', code: CurrencyCode::GBP->value, symbol: '£'),
            new self(name: 'Hong Kong Dollar', code: CurrencyCode::HKD->value, symbol: '$'),
            new self(name: 'Hungarian Forint', code: CurrencyCode::HUF->value, symbol: 'Ft'),
            new self(name: 'Indonesian Rupiah', code: CurrencyCode::IDR->value, symbol: 'Rp'),
            new self(name: 'Israeli New Sheqel', code: CurrencyCode::ILS->value, symbol: '₪'),
            new self(name: 'Indian Rupee', code: CurrencyCode::INR->value, symbol: '₹'),
            new self(name: 'Japanese Yen', code: CurrencyCode::JPY->value, symbol: '¥'),
            new self(name: 'South Korean Won', code: CurrencyCode::KRW->value, symbol: '₩'),
            new self(name: 'Kuwaiti Dinar', code: CurrencyCode::KWD->value, symbol: 'ك.د'),
            new self(name: 'Sri Lankan Rupee', code: CurrencyCode::LKR->value, symbol: 'Rs'),
            new self(name: 'Myanmar Kyat', code: CurrencyCode::MMK->value, symbol: 'K'),
            new self(name: 'Mexican Peso', code: CurrencyCode::MXN->value, symbol: '$'),
            new self(name: 'Malaysian Ringgit', code: CurrencyCode::MYR->value, symbol: 'RM'),
            new self(name: 'Nigerian Naira', code: CurrencyCode::NGN->value, symbol: '₦'),
            new self(name: 'Norwegian Krone', code: CurrencyCode::NOK->value, symbol: 'kr'),
            new self(name: 'New Zealand Dollar', code: CurrencyCode::NZD->value, symbol: '$'),
            new self(name: 'Philippine Peso', code: CurrencyCode::PHP->value, symbol: '₱'),
            new self(name: 'Pakistani Rupee', code: CurrencyCode::PKR->value, symbol: '₨'),
            new self(name: 'Russian Ruble', code: CurrencyCode::RUB->value, symbol: '₽'),
            new self(name: 'Polish Zloty', code: CurrencyCode::PLN->value, symbol: 'zł'),
            new self(name: 'Saudi Riyal', code: CurrencyCode::SAR->value, symbol: '﷼'),
            new self(name: 'Swedish Krona', code: CurrencyCode::SEK->value, symbol: 'kr'),
            new self(name: 'Singapore Dollar', code: CurrencyCode::SGD->value, symbol: '$'),
            new self(name: 'Thai Baht', code: CurrencyCode::THB->value, symbol: '฿'),
            new self(name: 'Turkish Lira', code: CurrencyCode::TRY->value, symbol: '₺'),
            new self(name: 'New Taiwan Dollar', code: CurrencyCode::TWD->value, symbol: '$'),
            new self(name: 'Ukrainian Hryvnia', code: CurrencyCode::UAH->value, symbol: '₴'),
            new self(name: 'Venezuelan BolÃvar', code: CurrencyCode::VEF->value, symbol: 'Bs'),
            new self(name: 'Vietnamese Dong', code: CurrencyCode::VND->value, symbol: '₫'),
            new self(name: 'South African Rand', code: CurrencyCode::ZAR->value, symbol: 'R'),

        ]);
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'code' => $this->code,
            'symbol' => $this->symbol,
        ];
    }
}
