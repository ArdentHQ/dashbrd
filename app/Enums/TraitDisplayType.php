<?php

declare(strict_types=1);

namespace App\Enums;

// The enum members are based on the Mnemonic display types, since they are
// at least documented which cannot be said about Alchemy.
//
// However, the enum is simply called `TraitDisplayType` for appearance reasons.
//
// https://docs.mnemonichq.com/references/uniform/rest/reference/#operation/FoundationalService_GetNftAllTraits
// https://docs.mnemonichq.com/tutorials/get-nft-traits/
use Carbon\Carbon;

enum TraitDisplayType: string
{
    case Property = 'DISPLAY_TYPE_PROPERTY';
    case Level = 'DISPLAY_TYPE_LEVEL';
    case Stat = 'DISPLAY_TYPE_STAT';
    case Boost = 'DISPLAY_TYPE_BOOST';
    case BoostPercentage = 'DISPLAY_TYPE_BOOST_PERCENTAGE';
    case Date = 'DISPLAY_TYPE_DATE';

    public static function fromAlchemyDisplayType(?string $displayType, string $value): self
    {
        // couldn't find a documentation for Alchemy, so I just handle the cases
        // I encountered.
        $type = match ($displayType) {
            'boost_percentage' => self::BoostPercentage,
            'number' => self::Stat,
            default => self::Property,
        };

        if ($type == self::Property) {
            return self::inferDisplayTypeFromValue($value);
        }

        return $type;
    }

    public static function fromMnemonicDisplayType(?string $displayType, ?string $value): self
    {
        if (empty($displayType)) {
            return self::inferDisplayTypeFromValue($value);
        }

        return self::from($displayType);
    }

    public function isNumeric(): bool
    {
        return match ($this) {
            self::Property => false,
            self::Boost, self::BoostPercentage, self::Level, self::Date, self::Stat => true,
        };

    }

    /**
     * @return array<string | null>
     */
    public function getValueColumns(string $value): array
    {
        // The trait value can be thought of as a union where only one of three columns (`value_string`, `value_numeric`, `value_date`)
        // is populated depending on the trait display type. This more or less mirrors
        // what the Mnemonic API gives us and is for efficiency reasons like this since we are dealing with a lot of data (rows).
        //
        // The application (i.e. PHP) is eventually responsible for taking into account the adequate column when searching/filtering NFTs based on trait values.
        //

        // NOTE: The values are casted into the adequate data type in SQL before insert.
        //
        // index 0: value_string
        // index 1: value_numeric
        // index 2: value_date
        return match ($this) {
            // string traits
            self::Property => [$value, null, null],
            // date traits
            self::Date => [null, null, $value],
            // numeric traits
            self::Boost,
            self::BoostPercentage,
            self::Level,
            self::Stat => [null, $value, null]
        };
    }

    private static function inferDisplayTypeFromValue(?string $value): self
    {
        if (empty($value)) {
            return self::Property;
        }

        // heuristically check based on the value if it's a date
        // since Alchemy does not provide a display type in those cases.
        //
        // "value": "2021-10-29 04:11:12"
        // "value": "2021-10-29 04:11"
        // "value": "2022-01-12"
        $formats = [
            'Y-m-d H:i:s',
            'Y-m-d H:i',
            'Y-m-d',
        ];
        if (collect($formats)->some(fn ($format) => Carbon::canBeCreatedFromFormat($value, $format))) {
            return self::Date;
        }

        return self::Property;
    }
}
