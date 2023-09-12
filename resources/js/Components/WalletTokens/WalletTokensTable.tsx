/* eslint-disable sonarjs/no-duplicate-string */
import uniq from "lodash/uniq";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInViewport } from "react-in-viewport";
import { type Column, type HeaderGroup, type TableState } from "react-table";
import { WalletTokensTableItemSkeleton } from "./WalletTokensTableItemSkeleton";
import { type TokensListSortBy } from "@/Components/PortfolioBreakdown/Hooks/useTokensList";
import { Table, TableCell, TableRow } from "@/Components/Table";
import { TokenDetailsSlider } from "@/Components/Tokens/TokenDetailsSlider";
import {
    Action,
    Balance,
    Chart,
    MarketCap,
    Price,
    Token,
    Volume,
} from "@/Components/WalletTokens/WalletTokensTable.blocks";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { assertUser } from "@/Utils/assertions";
import { WithLineChartData } from "@/Utils/Hooks/useLineChartData";
import { isTruthy } from "@/Utils/is-truthy";
const WalletTokensTableItem = ({
    asset,
    currency,
    index,
    onDetailsClick,
    isCompact,
    onVisible,
}: {
    asset: App.Data.TokenListItemData;
    currency: string;
    index: number;
    onVisible?: () => void;
    onDetailsClick: (asset: App.Data.TokenListItemData) => void;
    isCompact?: boolean;
}): JSX.Element => {
    const { isLgAndAbove, isXlAndAbove } = useBreakpoint();

    const reference = useRef(null);

    useInViewport(reference, {}, undefined, {
        onEnterViewport: onVisible,
    });

    if (!isTruthy(isCompact)) {
        return (
            <TableRow
                key={`${index}-${asset.symbol}-${asset.chain_id}`}
                ref={reference}
            >
                <TableCell
                    variant="start"
                    innerClassName="py-4"
                >
                    <Token
                        asset={asset}
                        onClick={onDetailsClick}
                    />
                </TableCell>

                <TableCell innerClassName="justify-end">
                    <Balance
                        asset={asset}
                        currency={currency}
                    />
                </TableCell>

                <TableCell innerClassName="justify-end">
                    <Price
                        asset={asset}
                        currency={currency}
                    />
                </TableCell>

                {isLgAndAbove && (
                    <TableCell innerClassName="justify-end">
                        <MarketCap
                            asset={asset}
                            currency={currency}
                        />
                    </TableCell>
                )}

                {isXlAndAbove && (
                    <TableCell innerClassName="justify-end">
                        <Volume
                            asset={asset}
                            currency={currency}
                        />
                    </TableCell>
                )}

                {isLgAndAbove && (
                    <TableCell innerClassName="justify-end">
                        <Chart
                            asset={asset}
                            currency={currency}
                        />
                    </TableCell>
                )}

                <TableCell
                    variant="end"
                    innerClassName="justify-end"
                >
                    <Action
                        asset={asset}
                        onClick={onDetailsClick}
                    />
                </TableCell>
            </TableRow>
        );
    }

    return (
        <button
            type="button"
            className="flex items-center justify-between rounded-xl border border-theme-secondary-300 px-4 py-5 outline-none outline-3 outline-offset-0 transition-all hover:outline-theme-hint-300 focus-visible:outline-theme-hint-300"
            onClick={() => {
                onDetailsClick(asset);
            }}
        >
            <Token asset={asset} />
            <Balance
                asset={asset}
                currency={currency}
            />
        </button>
    );
};

export const WalletTokensTable = ({
    tokens,
    currency,
    isLoading = false,
    user,
    onSend,
    onReceive,
    onLoadMore,
    onSort,
    sortBy = "fiat_balance",
    sortDirection = "desc",
    wallet,
}: {
    wallet?: App.Data.Wallet.WalletData | null;
    tokens: App.Data.TokenListItemData[];
    currency: string;
    isLoading?: boolean;
    user?: App.Data.UserData;
    onSend?: (asset: App.Data.TokenListItemData) => void;
    onReceive?: (asset: App.Data.TokenListItemData) => void;
    onLoadMore?: () => void;
    onSort?: (column: HeaderGroup<App.Data.TokenListItemData>) => void;
    sortBy?: TokensListSortBy;
    sortDirection?: "asc" | "desc";
}): JSX.Element => {
    const { t } = useTranslation();

    const [selectedAsset, setSelectedAsset] = useState<App.Data.TokenListItemData | undefined>();
    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        if (selectedAsset !== undefined) {
            setOpen(true);
        }
    }, [selectedAsset]);

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;

        if (!isOpen && selectedAsset !== undefined) {
            /* istanbul ignore next -- @preserve */
            timeout = setTimeout(() => {
                setSelectedAsset(undefined);
            }, 300);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [isOpen]);

    const { isSmAndAbove, isMdAndAbove, isLgAndAbove, isXlAndAbove } = useBreakpoint();

    const initialState = useMemo<Partial<TableState<App.Data.TokenListItemData>>>(
        () => ({
            sortBy: [
                {
                    desc: sortDirection === "desc",
                    id: sortBy,
                },
            ],
        }),
        [sortBy, sortDirection],
    );

    const columns = useMemo<Array<Column<App.Data.TokenListItemData>>>(() => {
        const columns: Array<Column<App.Data.TokenListItemData>> = [
            {
                Header: t("common.token").toString(),
                accessor: "symbol",
            },
            {
                Header: t("common.balance").toString(),
                accessor: "fiat_balance",
                className: "justify-end",
                sortDescFirst: true,
                cellWidth: "w-full",
            },
            {
                Header: t("common.price").toString(),
                accessor: "token_price",
                className: "justify-end",
                sortDescFirst: true,
            },
        ];

        columns.push({
            Header: "",
            id: "action",
            disableSortBy: true,
        });

        if (isLgAndAbove) {
            columns.splice(
                -1,
                0,
                {
                    Header: t("common.market_cap").toString(),
                    accessor: "total_market_cap",
                    className: "justify-end",
                    noWrap: true,
                    sortDescFirst: true,
                },
                {
                    Header: t("common.last_n_days", { count: 7 }),
                    id: "chart",
                    className: "justify-end",
                    disableSortBy: true,
                },
            );
        }

        if (isXlAndAbove) {
            columns.splice(-2, 0, {
                Header: t("common.volume", { frequency: "(24h)" }).toString(),
                accessor: "total_volume",
                className: "justify-end w-max",
                sortDescFirst: true,
            });
        }

        return columns;
    }, [t, isMdAndAbove, isLgAndAbove, isXlAndAbove]);

    const renderTableRow = useCallback(
        (asset: App.Data.TokenListItemData, index: number) => {
            if (isLoading) {
                return (
                    <WalletTokensTableItemSkeleton
                        index={index}
                        isCompact={!isSmAndAbove}
                        disabled={!isTruthy(user)}
                    />
                );
            }

            assertUser(user);

            return (
                <WalletTokensTableItem
                    asset={asset}
                    currency={user.attributes.currency}
                    index={index}
                    isCompact={!isSmAndAbove}
                    onDetailsClick={(asset: App.Data.TokenListItemData) => {
                        setSelectedAsset(asset);
                    }}
                    onVisible={() => {
                        const isViewingLastItems = tokens.length - index === 4;

                        if (!isViewingLastItems) {
                            return;
                        }

                        onLoadMore?.();
                    }}
                />
            );
        },
        [currency, isLoading, isSmAndAbove, user, tokens],
    );

    const tableData = isLoading ? (Array.from({ length: 5 }).fill({}) as App.Data.TokenListItemData[]) : tokens;

    return (
        <>
            {isTruthy(user) && (
                <TokenDetailsSlider
                    user={user}
                    asset={selectedAsset}
                    open={isOpen}
                    onClose={() => {
                        setOpen(false);
                    }}
                    onSend={onSend}
                    onReceive={onReceive}
                    wallet={wallet}
                />
            )}

            <WithLineChartData
                currency={currency}
                symbols={uniq(tokens.map((asset) => asset.symbol))}
            >
                <Table
                    manualSortBy
                    initialState={initialState}
                    activeSort={sortBy}
                    sortDirection={sortDirection}
                    variant={isSmAndAbove ? "default" : "borderless"}
                    columns={columns}
                    data={tableData}
                    row={renderTableRow}
                    onSort={onSort}
                    customWrapper={
                        isSmAndAbove
                            ? undefined
                            : (children: React.ReactNode) => <div className="flex flex-col space-y-3">{children}</div>
                    }
                />
            </WithLineChartData>
        </>
    );
};
