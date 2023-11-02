import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column, type Row, type TableState } from "react-table";

import {
    getBackgroundColor,
    getOtherGroupBackgroundColor,
} from "@/Components/PortfolioBreakdown/PortfolioBreakdown.helpers";
import { Table, TableCell, TableRow } from "@/Components/Table";
import { FormatCrypto, FormatFiat } from "@/Utils/Currency";
import { FormatPercentage } from "@/Utils/Percentage";

const isOtherGroup = (asset: App.Data.TokenPortfolioData): boolean => asset.symbol === "Other";

const PortfolioBreakdownTableItem = ({
    asset,
    currency,
    index,
}: {
    asset: App.Data.TokenPortfolioData;
    currency: string;
    index: number;
}): JSX.Element => {
    const color = isOtherGroup(asset) ? getOtherGroupBackgroundColor() : getBackgroundColor(index);

    return (
        <TableRow>
            <TableCell
                variant="start"
                innerClassName="py-2.5 space-x-3"
            >
                <div className={`h-8 w-1 ${color}`} />
                <div className="flex flex-col">
                    <span className="font-medium dark:text-theme-dark-50">
                        {asset.symbol}{" "}
                        <span className="text-theme-secondary-500 dark:text-theme-dark-200 sm:hidden">
                            &nbsp;
                            <FormatPercentage value={Number(asset.percentage)} />
                        </span>
                    </span>
                    <span
                        className="max-w-[8rem] truncate text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-300"
                        data-testid="PortfolioBreakdownItemAsset"
                    >
                        {asset.name}
                    </span>
                </div>
            </TableCell>

            <TableCell innerClassName="py-2.5 justify-end">
                <div className="flex flex-col items-end">
                    <span className="font-medium dark:text-theme-dark-50">
                        <FormatFiat
                            value={asset.fiat_balance}
                            currency={currency}
                        />
                    </span>

                    {!isOtherGroup(asset) && (
                        <span className="whitespace-nowrap text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-300">
                            <FormatCrypto
                                token={{
                                    name: asset.name,
                                    symbol: asset.symbol,
                                    decimals: asset.decimals !== null ? Number(asset.decimals) : 18,
                                }}
                                value={asset.balance ?? "0"}
                            />
                        </span>
                    )}
                </div>
            </TableCell>

            <TableCell
                variant="end"
                className="hidden sm:table-cell"
                innerClassName="justify-end"
            >
                <span className="font-medium text-theme-secondary-700 dark:text-theme-dark-200">
                    <FormatPercentage value={Number(asset.percentage)} />
                </span>
            </TableCell>
        </TableRow>
    );
};

export const PortfolioBreakdownTable = ({
    assets,
    currency,
}: {
    assets: App.Data.TokenPortfolioData[];
    currency: string;
}): JSX.Element => {
    const { t } = useTranslation();

    const initialState = useMemo<Partial<TableState<App.Data.TokenPortfolioData>>>(
        () => ({
            sortBy: [
                {
                    desc: true,
                    id: "percentage",
                },
            ],
        }),
        [],
    );

    const columns = useMemo<Array<Column<App.Data.TokenPortfolioData>>>(
        () => [
            {
                Header: t("common.token").toString(),
                id: "symbol",
                accessor: (asset) => asset.symbol,
                cellWidth: "w-full",
            },
            {
                Header: t("common.amount").toString(),
                id: "convertedBalance",
                accessor: (asset) => Number(asset.fiat_balance),
                className: "justify-end",
                sortDescFirst: true,
            },
            {
                Header: "%",
                id: "percentage",
                accessor: (asset) => Number(asset.percentage),
                headerClassName: "hidden sm:table-cell",
                className: "justify-end",
                sortDescFirst: true,
                sortType: (rowA: Row<App.Data.TokenPortfolioData>, rowB: Row<App.Data.TokenPortfolioData>): number => {
                    const percentA = Number(rowA.values.percentage);
                    const percentB = Number(rowB.values.percentage);

                    if (percentA === percentB) {
                        return 0;
                    }

                    return percentA < percentB ? -1 : 1;
                },
            },
        ],
        [t],
    );

    const renderTableRow = useCallback(
        (asset: App.Data.TokenPortfolioData, index: number) => (
            <PortfolioBreakdownTableItem
                asset={asset}
                currency={currency}
                index={index}
            />
        ),
        [currency],
    );

    return (
        <Table
            variant="borderless"
            columns={columns}
            data={assets}
            initialState={initialState}
            row={renderTableRow}
        />
    );
};
