import cn from "classnames";
import React, { memo, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, IconButton } from "@/Components/Buttons";
import { PriceChart } from "@/Components/PortfolioBreakdown";
import { PriceChange } from "@/Components/PriceChange/PriceChange";
import { Skeleton } from "@/Components/Skeleton";
import { TokenLogo } from "@/Components/Tokens/TokenLogo";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { useNetwork } from "@/Hooks/useNetwork";
import { FormatCrypto, FormatFiat, FormatFiatShort } from "@/Utils/Currency";
import { useLineChartData } from "@/Utils/Hooks/useLineChartData";
import { type LineChartPriceHistoryData } from "@/Utils/Hooks/useLineChartData.contracts";

const PLACEHOLDER_VALUES = [4, 5, 2, 2, 2, 3, 5, 1, 4, 5, 6, 5, 3, 3, 4, 5, 6, 4, 4, 4, 5, 8, 8, 10];

interface Properties {
    asset: App.Data.TokenListItemData;
    currency: string;
    onClick: (asset: App.Data.TokenListItemData) => void;
}

export const Action = ({ asset, onClick }: Omit<Properties, "currency">): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <Button
                data-testid="WalletTokensTable__action_details"
                className="hidden overflow-hidden group-hover:bg-theme-secondary-200 md:inline"
                onClick={() => {
                    onClick(asset);
                }}
                variant="secondary"
            >
                <div className="transition-default -mx-5 -my-2 px-5 py-2 hover:bg-theme-secondary-300">
                    {t("common.details")}
                </div>
            </Button>

            <IconButton
                data-testid="WalletTokensTable__action_details_small"
                className="flex md:hidden"
                icon="ChevronRightSmall"
                onClick={() => {
                    onClick(asset);
                }}
            />
        </>
    );
};

export const Token = memo(
    ({ asset, onClick }: Partial<Properties> & Pick<Properties, "asset">): JSX.Element => {
        const { isTestnet } = useNetwork();
        const Wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => {
            if (onClick === undefined) {
                return (
                    <div
                        data-testid="WalletTokensTable__token"
                        className="flex items-center space-x-3"
                    >
                        {children}
                    </div>
                );
            }

            return (
                <button
                    data-testid="WalletTokensTable__token"
                    type="button"
                    className="transition-default group/token flex items-center space-x-3 rounded-2xl outline-none outline-3 outline-offset-4 focus-visible:outline-theme-hint-300"
                    onClick={() => {
                        onClick(asset);
                    }}
                >
                    {children}
                </button>
            );
        };

        return (
            <Wrapper>
                <TokenLogo
                    tokenName={asset.name}
                    chainId={asset.chain_id}
                    imgSource={asset.logo_url}
                    className={cn("h-10 w-10", {
                        "opacity-40 saturate-0": isTestnet(asset.chain_id),
                    })}
                />

                <div className="flex flex-col items-start space-y-0.5 whitespace-nowrap font-medium">
                    <span
                        data-testid="WalletTokensTable__token_symbol"
                        className="text-sm leading-5.5 text-theme-secondary-900 group-hover/token:text-theme-hint-700 sm:text-base sm:leading-6"
                    >
                        {asset.symbol}
                    </span>
                    <span
                        data-testid="WalletTokensTable__token_name"
                        className="text-xs leading-4.5 text-theme-secondary-500 sm:text-sm sm:leading-5.5"
                    >
                        {asset.name}
                    </span>
                </div>
            </Wrapper>
        );
    },
    /* istanbul ignore next -- @preserve */
    (previous, next) => previous.asset.name === next.asset.name,
);

Token.displayName = "Token";

export const Balance = ({ asset, currency }: Omit<Properties, "onClick">): JSX.Element => {
    const reference = useRef<HTMLHeadingElement>(null);
    const fiatReference = useRef<HTMLHeadingElement>(null);
    const isTruncated = useIsTruncated({ reference });
    const isFiatTruncated = useIsTruncated({ reference: fiatReference });

    const token: Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals"> = {
        symbol: asset.symbol,
        name: asset.name,
        decimals: asset.decimals,
    };

    return (
        <div
            data-testid="WalletTokensTable__balance"
            className="relative flex w-full flex-col items-end space-y-0.5 font-medium"
        >
            <div className="relative h-5.5 w-full">
                <div className="absolute w-full font-medium">
                    <Tooltip
                        disabled={!isFiatTruncated}
                        content={
                            <FormatFiat
                                value={asset.fiat_balance ?? "0"}
                                currency={currency}
                            />
                        }
                    >
                        <div
                            ref={fiatReference}
                            data-testid="WalletTokensTable__balance_fiat"
                            className="truncate text-right text-sm leading-5.5 text-theme-secondary-900 sm:text-base sm:leading-6"
                        >
                            <FormatFiat
                                value={asset.fiat_balance ?? "0"}
                                currency={currency}
                            />
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div className="relative h-5.5 w-full">
                <div className="absolute w-full font-medium">
                    <div
                        className="break-word-legacy min-w-0 text-right"
                        data-testid="WalletTokensTable__balance_crypto"
                    >
                        <Tooltip
                            disabled={!isTruncated}
                            content={
                                <FormatCrypto
                                    token={token}
                                    value={asset.balance}
                                />
                            }
                        >
                            <div
                                ref={reference}
                                className="truncate text-xs leading-4.5 text-theme-secondary-500 sm:text-sm sm:leading-5.5"
                            >
                                <FormatCrypto
                                    token={token}
                                    value={asset.balance}
                                />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};

const calculatePriceChangePercentage = (price: number, change: number): number => {
    const diff = price - change;
    return Math.abs(diff) > Number.EPSILON ? 100 * (price / diff - 1) : 0;
};

export const Price = ({ asset, currency }: Omit<Properties, "onClick">): JSX.Element => (
    <span
        data-testid="WalletTokensTable__price"
        className="flex flex-col items-end space-y-0.5 font-medium"
    >
        <span
            data-testid="WalletTokensTable__price_fiat"
            className="text-base leading-6 text-theme-secondary-700"
        >
            <FormatFiat
                value={asset.token_price?.toString() ?? "0"}
                currency={currency}
            />
        </span>
        <span
            data-testid="WalletTokensTable__price_change"
            className="text-sm leading-5.5"
        >
            <PriceChange
                change={calculatePriceChangePercentage(
                    Number(asset.token_price),
                    Number(asset.price_change_24h_in_currency),
                )}
            />
        </span>
    </span>
);

export const MarketCap = ({ asset, currency }: Omit<Properties, "onClick">): JSX.Element => (
    <span
        data-testid="WalletTokensTable__market-cap"
        className="font-medium text-theme-secondary-700"
    >
        <FormatFiatShort
            value={asset.total_market_cap?.toString() ?? "0"}
            currency={currency}
        />
    </span>
);

export const Volume = ({ asset, currency }: Omit<Properties, "onClick">): JSX.Element => (
    <span
        data-testid="WalletTokensTable__volume"
        className="font-medium text-theme-secondary-700"
    >
        <FormatFiatShort
            value={asset.total_volume?.toString() ?? "0"}
            currency={currency}
        />
    </span>
);

export const Chart = ({ asset }: Omit<Properties, "onClick">): JSX.Element => {
    const { t } = useTranslation();
    const { chartData, errored, loadedSymbols } = useLineChartData();

    const symbolLoaded = useMemo(() => loadedSymbols.includes(asset.symbol), [loadedSymbols, asset.symbol]);

    const hasData = useMemo(() => {
        if (errored) {
            return false;
        }

        if (!symbolLoaded) {
            return false;
        }

        const data = (chartData as LineChartPriceHistoryData)[asset.symbol];

        // Using length > 1 because some tokens return a single value and
        // the chart will render empty
        return data !== undefined && data.length > 1;
    }, [chartData, symbolLoaded, asset]);

    const values = useMemo(() => {
        if (!hasData) {
            return PLACEHOLDER_VALUES;
        }

        const data = (chartData as LineChartPriceHistoryData)[asset.symbol] as App.Data.PriceHistoryData[];

        return data.map((value) => value.price);
    }, [chartData, hasData]);

    const labels = useMemo<string[]>(() => Object.keys(values), [values]);

    const isErrored = useMemo(() => symbolLoaded && !hasData, [hasData, symbolLoaded]);

    if (!symbolLoaded) {
        return (
            <Skeleton
                data-testloading
                className="h-10 w-25"
            />
        );
    }

    return (
        <Tooltip
            content={t("pages.dashboard.line_chart.data_error").toString()}
            disabled={!isErrored}
        >
            <span
                data-testid="WalletTokensTable__chart"
                data-testerrored={isErrored}
                className="text-sm italic text-theme-secondary-500"
            >
                <PriceChart
                    isPlaceholder={isErrored}
                    labels={labels}
                    values={values}
                />
            </span>
        </Tooltip>
    );
};
