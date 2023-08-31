import cn from "classnames";
import React from "react";
import { type PriceChangeProperties } from "./PriceChange.contracts";
import { formatPriceChange, getPriceChangeType } from "./PriceChange.utils";

export const PriceChange = ({ change }: PriceChangeProperties): JSX.Element => {
    const type = getPriceChangeType(change);

    return (
        <div data-testid="PriceChange">
            <div
                data-testid="PriceChange__wrapper"
                className={cn("font-medium", {
                    "text-theme-success-600": type === "positive",
                    "text-theme-danger-400": type === "negative",
                    "text-theme-secondary-700": type === "neutral",
                })}
            >
                {formatPriceChange(change)}
            </div>
        </div>
    );
};
