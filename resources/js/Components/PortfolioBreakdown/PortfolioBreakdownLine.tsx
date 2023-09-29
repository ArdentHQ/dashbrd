import cn from "classnames";

import { useMemo } from "react";
import {
    getBackgroundColor,
    getOtherGroupBackgroundColor,
} from "@/Components/PortfolioBreakdown/PortfolioBreakdown.helpers";
import {
    type Breakpoints,
    getAssetBreakpointClasses,
    getOtherAssetClasses,
} from "@/Components/PortfolioBreakdown/PortfolioBreakdownLine.contracts";
import { Tooltip } from "@/Components/Tooltip";
import { FormatPercentage } from "@/Utils/Percentage";

const isOtherGroup = (asset: App.Data.TokenPortfolioData): boolean => asset.symbol === "Other";

const PortfolioBreakdownLineItem = ({
    asset,
    index,
    className,
}: {
    asset: App.Data.TokenPortfolioData;
    index: number;
    className?: string;
}): JSX.Element => {
    const color = isOtherGroup(asset) ? getOtherGroupBackgroundColor() : getBackgroundColor(index);

    return (
        <Tooltip
            offset={[0, 4]}
            content={
                <PortfolioTooltip
                    asset={asset}
                    className={color}
                />
            }
        >
            <span
                data-symbol={asset.symbol}
                className={cn("transition-default hover:scale-y-150", color, className)}
                data-testid="PortfolioBreakdownLine__item"
                style={{ width: `${Number(asset.percentage) * 100}%` }}
            ></span>
        </Tooltip>
    );
};

const PortfolioTooltip = ({
    asset,
    className,
}: {
    asset: App.Data.TokenPortfolioData;
    className: string;
}): JSX.Element => (
    <span className="flex items-center space-x-2 text-sm font-medium">
        <span className={cn("h-4 w-0.5 rounded-sm", className)} />

        <span className="text-theme-secondary-200">{asset.symbol}</span>
        <span className="text-theme-secondary-500">
            <FormatPercentage value={Number(asset.percentage)} />
        </span>
    </span>
);

const assetsWithBreakpoints = (assets: App.Data.TokenPortfolioData[], breakpoints: Breakpoints): JSX.Element[] => {
    const responsiveAssets: JSX.Element[] = [];

    for (const [index, asset] of Object.entries(assets)) {
        const assetIndex = Number(index);

        if (assetIndex > Math.max(...Object.values(breakpoints))) {
            continue;
        }

        if (assetIndex < Math.max(...Object.values(breakpoints))) {
            responsiveAssets.push(
                <PortfolioBreakdownLineItem
                    className={getAssetBreakpointClasses(breakpoints, assetIndex)}
                    asset={asset}
                    index={assetIndex}
                    key={index}
                />,
            );
        }
    }

    const countsShown: number[] = [];
    for (const countToShow of Object.values(breakpoints)) {
        if (countsShown.includes(countToShow)) {
            continue;
        }

        countsShown.push(countToShow);

        const otherPercent = assets
            .slice(countToShow)
            .reduce((totalPercentage, asset) => totalPercentage + Number(asset.percentage), 0);
        if (otherPercent === 0) {
            continue;
        }

        responsiveAssets.push(
            <PortfolioBreakdownLineItem
                className={getOtherAssetClasses(breakpoints, countToShow)}
                asset={{
                    name: "OTHER",
                    symbol: "Other",
                    decimals: "18",
                    balance: null,
                    fiat_balance: "0",
                    percentage: otherPercent.toString(),
                }}
                index={countToShow}
                key={`other-${countToShow}`}
            />,
        );
    }

    return responsiveAssets;
};

export const PortfolioBreakdownLine = ({
    assets,
    className,
    breakpoints,
}: {
    assets: App.Data.TokenPortfolioData[];
    className?: string;
    breakpoints?: Breakpoints;
}): JSX.Element => {
    const allTokensAreZero = useMemo(() => assets.every((asset) => Number(asset.fiat_balance) === 0), [assets]);

    return (
        <div className={cn("flex h-2 w-full", className)}>
            {(assets.length === 0 || allTokensAreZero) && (
                <div className="flex w-full bg-theme-secondary-200 dark:bg-theme-dark-600" />
            )}

            {assets.length > 0 &&
                !allTokensAreZero &&
                breakpoints !== undefined &&
                assetsWithBreakpoints(assets, breakpoints)}

            {assets.length > 0 &&
                !allTokensAreZero &&
                breakpoints === undefined &&
                assets.map((asset, index) => (
                    <PortfolioBreakdownLineItem
                        asset={asset}
                        index={index}
                        key={index}
                    />
                ))}
        </div>
    );
};
