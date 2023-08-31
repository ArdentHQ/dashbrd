import { type PriceChangeType } from "./PriceChange.contracts";

const roundDecimals = (value: number, decimals: number): number => Number.parseFloat(value.toFixed(decimals));

export const getPriceChangeType = (change: number): PriceChangeType => {
    /*
        The lower lines shows the 24h change in percentage.
        It is always shown with 2 decimals, e.g. 4.00%, 4.21%, 0.00%

        If the change is negative, we show it in red with a minus sign in front
        If the change is positive, we show it in green with a plus sign in front
        If the change is 0, there’s 3 options:
            it’s actually 0.000% (3 decimals) -> show 0.00% in grey
            it’s actually 0.001% (3 decimals) -> show +0.00% in green
            it’s actually -0.001% (3 decimals) -> show -0.00% in red
    */

    const rounded = roundDecimals(change, 3);

    if (rounded > 0.0) return "positive";
    if (rounded < 0.0) return "negative";
    return "neutral";
};

export const formatPriceChange = (change: number): string => {
    const type = getPriceChangeType(change);
    const prefix = type === "positive" ? "+" : "";
    return `${prefix}${change.toFixed(2)}%`;
};
