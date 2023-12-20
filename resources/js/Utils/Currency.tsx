import { ethers } from "ethers";
import { type TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { browserLocale } from "@/Utils/browser-locale";

interface CurrencyProperties {
    user?: App.Data.UserData;
    value: string;
    currency?: string;
    minDecimals?: number;
    maxDecimals?: number;
}

interface FiatProperties extends CurrencyProperties {
    short?: boolean;
    t: TFunction<"translation", undefined, "translation">;
}

interface CryptoProperties {
    value: string;
    token: App.Data.Token.TokenData | Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals">;
    maximumFractionDigits?: number;
}

const fiatValue = ({
    t,
    user,
    value,
    currency,
    minDecimals = 2,
    maxDecimals = 2,
    short = false,
}: FiatProperties): string => {
    if (currency === undefined) {
        if (user?.attributes.currency !== undefined) {
            currency = user.attributes.currency;
        } else {
            currency = "USD";
        }
    }

    return `${t("format.fiat", {
        value,
        currency,
        formatParams: {
            value: {
                lng: browserLocale(),
                minimumFractionDigits: minDecimals,
                maximumFractionDigits: maxDecimals,
                notation: short ? "compact" : "standard",
            },
        },
    })}`;
};

export const formatFiat = (properties: FiatProperties): string => fiatValue(properties);

export const formatFiatShort = ({ minDecimals, maxDecimals, ...properties }: FiatProperties): string =>
    fiatValue({
        ...properties,
        minDecimals: minDecimals ?? 0,
        maxDecimals: maxDecimals ?? 1,
        short: true,
    });

export const FormatFiat = (properties: CurrencyProperties): JSX.Element => {
    const { t } = useTranslation();

    return <>{formatFiat({ t, ...properties })}</>;
};

export const FormatFiatShort = (properties: CurrencyProperties): JSX.Element => {
    const { t } = useTranslation();

    return <>{formatFiatShort({ t, ...properties })}</>;
};

/**
 * Checks if value contains "." and if it does, then it's a float and we need to convert it to a fixed number
 * @param value  The value to check
 * @returns  The formatted value
 */
const formatValue = (value: CryptoProperties["value"]): string => {
    let formattedValue: string;

    if (value.includes(".")) {
        formattedValue = ethers.FixedNumber.from(value)._hex;
    } else {
        formattedValue = value;
    }

    return formattedValue;
};

export const formatCrypto = ({
    value,
    token,
    t,
    maximumFractionDigits = 4,
}: CryptoProperties & {
    t: TFunction<"translation", undefined, "translation">;
}): string => {
    const formattedValue = formatValue(value);
    return t("format.number", {
        value: ethers.utils.formatUnits(formattedValue, token.decimals),
        formatParams: {
            value: {
                lng: browserLocale(),
                minimumFractionDigits: 0,
                maximumFractionDigits,
            },
        },
    });
};

export const FormatCrypto = ({ value, token, maximumFractionDigits }: CryptoProperties): JSX.Element => {
    const { t } = useTranslation();

    const number = formatCrypto({
        value,
        token,
        t,
        maximumFractionDigits,
    });

    return <>{`${number} ${token.symbol.toUpperCase()}`}</>;
};

export const FormatNumber = ({ value }: { value: string | number }): JSX.Element => {
    const { t } = useTranslation();

    const number = t("format.number", {
        value,
        formatParams: {
            value: {
                lng: browserLocale(),
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
            },
        },
    });

    return <>{number}</>;
};
