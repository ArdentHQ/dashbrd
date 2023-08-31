import cn from "classnames";

import { t } from "i18next";
import {
    getBackgroundColor,
    getOtherGroupBackgroundColor,
} from "@/Components/PortfolioBreakdown/PortfolioBreakdown.helpers";
import { FormatPercentage } from "@/Utils/Percentage";

const isOtherGroup = (asset: App.Data.TokenPortfolioData): boolean => asset.symbol === "Other";

const PortfolioBreakdownTextItem = ({
    asset,
    index,
}: {
    asset: App.Data.TokenPortfolioData;
    index: number;
}): JSX.Element => {
    const color = isOtherGroup(asset) ? getOtherGroupBackgroundColor() : getBackgroundColor(index);

    return (
        <span
            className="flex items-center space-x-1 text-sm font-medium"
            data-testid="PortfolioBreakdownText__item"
        >
            <span className={cn("h-3 w-1", color)} />

            <span className="text-theme-secondary-700">{asset.symbol}</span>
            <span className="text-theme-secondary-500">
                <FormatPercentage value={Number(asset.percentage)} />
            </span>
        </span>
    );
};

export const PortfolioBreakdownText = ({
    assets,
    className,
    showCount,
}: {
    assets: App.Data.TokenPortfolioData[];
    className?: string;
    showCount: number;
}): JSX.Element => {
    const visibleAssets = assets.slice(0, showCount);
    const otherAssets = assets.slice(showCount);
    const otherItem =
        otherAssets.length > 0 ? (
            <PortfolioBreakdownTextItem
                asset={{
                    name: otherAssets.map((asset) => asset.name).join(", "),
                    symbol: t("common.other"),
                    balance: null,
                    decimals: null,
                    fiat_balance: otherAssets
                        .reduce(
                            (total: number, asset: App.Data.TokenPortfolioData) => total + Number(asset.fiat_balance),
                            0,
                        )
                        .toString(),
                    percentage: otherAssets
                        .reduce(
                            (total: number, asset: App.Data.TokenPortfolioData) => total + Number(asset.percentage),
                            0,
                        )
                        .toString(),
                }}
                index={visibleAssets.length}
                key={visibleAssets.length}
            />
        ) : null;

    return (
        <div className={cn("flex h-2 w-full space-x-4", className)}>
            {visibleAssets.map((asset, index) => (
                <PortfolioBreakdownTextItem
                    asset={asset}
                    index={index}
                    key={index}
                />
            ))}

            {otherItem}
        </div>
    );
};
