import { useTranslation } from "react-i18next";
import { browserLocale } from "@/Utils/browser-locale";

interface PercentageProperties {
    value: number;
    decimals?: number;
    showSign?: boolean;
}

export const FormatPercentage = ({ value, decimals = 1, showSign = true }: PercentageProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            {t("format.number", {
                value: Math.round((value + Number.EPSILON) * Math.pow(10, 2 + decimals)) / Math.pow(10, decimals),
                formatParams: {
                    value: {
                        lng: browserLocale(),
                        maximumFractionDigits: decimals,
                    },
                },
            })}
            {showSign ? "%" : ""}
        </>
    );
};
