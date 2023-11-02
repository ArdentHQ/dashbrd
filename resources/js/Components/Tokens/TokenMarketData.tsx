import cn from "classnames";
import { useState } from "react";
import { TokenLinks } from "./TokenLinks";
import { TokenDetails } from "@/Components/Tokens/TokenDetails";
import { TokenPricePeriod } from "@/Components/Tokens/TokenMarketData.blocks";
import { TokenPriceChart } from "@/Components/Tokens/TokenPriceChart";
import { Period } from "@/Components/Tokens/Tokens.contracts";

interface Properties extends React.HTMLAttributes<HTMLDivElement> {
    token: App.Data.TokenListItemData;
}

export const TokenMarketData = ({ token, className, ...properties }: Properties): JSX.Element => {
    const [period, setPeriod] = useState(Period.DAY);

    const handlePeriodChange = (index: number): void => {
        setPeriod(Object.values(Period)[index]);
    };

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border-theme-secondary-300 dark:border-theme-dark-700 sm:border",
                className,
            )}
            {...properties}
        >
            <div className="sm:p-6">
                <div className="mb-6">
                    <TokenPricePeriod onChange={handlePeriodChange} />
                </div>

                <TokenPriceChart
                    token={token}
                    period={period}
                />

                <div className="mt-6 border-t border-dashed border-theme-secondary-300 pt-6 dark:border-theme-dark-700">
                    <TokenDetails token={token} />
                </div>
            </div>

            <TokenLinks token={token} />
        </div>
    );
};
