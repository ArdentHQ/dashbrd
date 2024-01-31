<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\Chain;
use App\Enums\CurrencyCode;
use App\Enums\Period;
use Illuminate\Foundation\Http\FormRequest;

class FilterableCollectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the chain that the user wants to filter collections by.
     */
    public function chain(): ?Chain
    {
        return match ($this->query('chain')) {
            'polygon' => Chain::Polygon,
            'ethereum' => Chain::ETH,
            default => null,
        };
    }

    /**
     * Get the user's currency or fallback to the default currency.
     */
    public function currency(): CurrencyCode
    {
        return $this->user()?->currency() ?? CurrencyCode::USD;
    }

    /**
     * Get the period value that the user wants to filter collections by.
     */
    public function period(): Period
    {
        return match ($this->query('period')) {
            '7d' => Period::WEEK,
            '30d' => Period::MONTH,
            default => Period::DAY,
        };
    }
}
