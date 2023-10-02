import cn from "classnames";
import { useTranslation } from "react-i18next";
import { type Column } from "react-table";
import { Badge } from "@/Components/Badge";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Icon } from "@/Components/Icon";
import { Skeleton } from "@/Components/Skeleton";
import { Table, TableCell, TableRow } from "@/Components/Table";
import { TimeAgo } from "@/Components/TimeAgo";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { convertToFiat } from "@/Utils/convert-currency";
import { FormatCrypto, FormatFiat } from "@/Utils/Currency";
import { toHuman } from "@/Utils/dates";
import { ExplorerChains } from "@/Utils/Explorer";
import { isTruthy } from "@/Utils/is-truthy";

const skeletonsCount = 10;

export const TransactionDirectionIcon = ({ transaction }: { transaction: App.Data.TransactionData }): JSX.Element => {
    if (isTruthy(transaction.isErrored)) {
        return (
            <Icon
                size="lg"
                name="XInCircle"
                className="text-theme-danger-600"
            />
        );
    }

    if (isTruthy(transaction.isSent)) {
        return (
            <Icon
                name="FatArrowUp"
                size="lg"
                className={cn({
                    "text-theme-danger-500": !isTruthy(transaction.isPending),
                    "text-theme-secondary-500": isTruthy(transaction.isPending),
                })}
            />
        );
    }

    return (
        <Icon
            name="FatArrowDown"
            size="lg"
            className={cn({
                "text-theme-success-700": !isTruthy(transaction.isPending),
                "text-theme-secondary-500": isTruthy(transaction.isPending),
            })}
        />
    );
};

export const TransactionStatusBadge = ({ transaction }: { transaction: App.Data.TransactionData }): JSX.Element => {
    const { t } = useTranslation();

    if (isTruthy(transaction.isPending)) {
        return (
            <Badge type="info">
                <>
                    <span className="hidden sm:inline">{t("common.pending_confirmation")}</span>
                    <span className="inline sm:hidden">{t("common.pending")}</span>
                </>
            </Badge>
        );
    }

    if (isTruthy(transaction.isErrored)) {
        return <Badge type="danger">{t("common.error")}</Badge>;
    }

    return <></>;
};

export const TokenTransactionItem = ({
    transaction,
    user,
    asset,
    onClick,
}: {
    user: App.Data.UserData;
    transaction: App.Data.TransactionData;
    asset: App.Data.TokenListItemData;
    onClick?: (transaction: App.Data.TransactionData) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const amountPrefix = isTruthy(transaction.isSent) ? "-" : "+";

    return (
        <TableRow
            key={transaction.hash}
            data-testid="TokenTransactionItem__row"
            onClick={() => {
                onClick?.(transaction);
            }}
        >
            <TableCell innerClassName="py-4 pr-0 pl-0 sm:pl-4">
                <div
                    className="flex items-center"
                    data-testid="TokenTransactionItem"
                >
                    <div className="mr-5 hidden sm:block">
                        <TransactionDirectionIcon transaction={transaction} />
                    </div>

                    <div className="space-y-0.5 font-medium">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm leading-5.5 text-theme-secondary-900 sm:text-base md:leading-6">
                                {isTruthy(transaction.isSent) ? t("common.sent") : t("common.received")}
                            </span>

                            <TransactionStatusBadge transaction={transaction} />
                        </div>
                        <div className="line-clamp-1 break-all text-xs leading-4.5 text-theme-secondary-500 sm:text-sm sm:leading-5.5">
                            <div className="block sm:hidden">
                                <TimeAgo date={new Date(transaction.timestamp * 1000).toISOString()} />
                            </div>
                            <div className="hidden sm:block">
                                {toHuman(transaction.timestamp * 1000, user.attributes)}
                            </div>
                        </div>
                    </div>
                </div>
            </TableCell>

            <TableCell innerClassName="py-4 justify-end px-0 pr-0 sm:px-4">
                <div className="flex flex-col items-end space-y-0.5 font-medium">
                    <div className="whitespace-nowrap text-sm leading-5.5 text-theme-secondary-900 sm:text-base sm:leading-6">
                        <span>{amountPrefix} </span>
                        <FormatFiat
                            value={convertToFiat(
                                transaction.amount,
                                Number(asset.token_price),
                                asset.decimals,
                            ).toString()}
                            currency={user.attributes.currency}
                        />
                    </div>
                    <div className="whitespace-nowrap text-xs leading-4.5 text-theme-secondary-500 sm:text-sm sm:leading-5.5">
                        <span>{amountPrefix} </span>
                        <FormatCrypto
                            token={{
                                name: asset.name,
                                symbol: asset.symbol,
                                decimals: asset.decimals,
                            }}
                            value={transaction.amount}
                        />
                    </div>
                </div>
            </TableCell>
        </TableRow>
    );
};

export const TokenTransactionItemSkeleton = ({ id }: { id: number }): JSX.Element => (
    <TableRow key={id}>
        <TableCell
            variant="start"
            innerClassName="py-4"
        >
            <div className="flex items-center space-x-5">
                <Skeleton className="h-6 w-5" />

                <div className="space-y-0.5 py-px font-medium">
                    <div className="mt-1 flex items-center space-x-2">
                        <span className="text-sm leading-5.5 text-theme-secondary-900 sm:text-base sm:leading-6">
                            <Skeleton className="h-4 w-15" />
                        </span>

                        <Skeleton className="h-4 w-10 rounded-xl" />
                    </div>
                    <div className="line-clamp-1 break-all text-xs leading-4.5 text-theme-secondary-500 sm:text-sm sm:leading-5.5">
                        <Skeleton className="mt-2 h-3 w-32" />
                    </div>
                </div>
            </div>
        </TableCell>

        <TableCell
            innerClassName="py-4 justify-end"
            variant="end"
        >
            <div className="mt-1 flex flex-col items-end space-y-0.5 font-medium">
                <div className="text-sm leading-5.5 text-theme-secondary-900 sm:text-base sm:leading-6">
                    <Skeleton className="h-4 w-8" />
                </div>
                <div className="line-clamp-1 break-all text-xs leading-4.5 text-theme-secondary-500 sm:text-sm sm:leading-5.5">
                    <Skeleton className="mt-2 h-4 w-12" />
                </div>
            </div>
        </TableCell>
    </TableRow>
);

export const TokenTransactionsTable = ({
    transactions,
    user,
    asset,
    isLoading = false,
    onRowClick,
}: {
    transactions: App.Data.TransactionData[];
    user: App.Data.UserData;
    asset: App.Data.TokenListItemData;
    isLoading?: boolean;
    onRowClick?: (transaction: App.Data.TransactionData) => void;
}): JSX.Element => {
    const { t } = useTranslation();
    const { isXs, is2Xs } = useBreakpoint();

    const columns: Array<Column<App.Data.TransactionData>> = [
        {
            Header: t("common.type").toString(),
            id: "type",
        },
        {
            Header: t("common.amount").toString(),
            id: "amount",
            disableSortBy: true,
            className: "justify-end",
        },
    ];

    if (isLoading) {
        return (
            <Table
                variant={isXs || is2Xs ? "borderless" : "default"}
                hideHeader={isXs || is2Xs}
                data-testid="TokenTransactionsTableSkeleton"
                columns={columns}
                data={Array.from({ length: skeletonsCount }).fill({}) as App.Data.TransactionData[]}
                row={(_, id: number) => <TokenTransactionItemSkeleton id={id} />}
            />
        );
    }

    return (
        <Table
            variant={isXs || is2Xs ? "borderless" : "default"}
            hideHeader={isXs || is2Xs}
            data-testid="TokenTransactionsTable"
            columns={columns}
            data={transactions}
            row={(transaction) => (
                <TokenTransactionItem
                    asset={asset}
                    user={user}
                    transaction={transaction}
                    onClick={onRowClick}
                />
            )}
        />
    );
};

export const ExplorerButton = ({
    chainId,
    address,
    tokenAddress,
    isNativeToken = false,
}: {
    chainId: ExplorerChains;
    address?: string;
    tokenAddress: string;
    isNativeToken?: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    if (![ExplorerChains.EthereumMainnet, ExplorerChains.PolygonMainnet].includes(chainId)) {
        return <></>;
    }

    if (chainId === ExplorerChains.EthereumMainnet) {
        return (
            <ButtonLink
                data-testid="ExplorerButton"
                target="_blank"
                href={
                    isNativeToken
                        ? t("urls.explorers.etherscan.addresses", { address })
                        : t("urls.explorers.etherscan.token_transactions", { address, token: tokenAddress })
                }
                variant="primary"
                className="mt-6"
            >
                {t("common.view_more_on_etherscan")}
            </ButtonLink>
        );
    }

    return (
        <ButtonLink
            data-testid="ExplorerButton"
            target="_blank"
            href={
                isNativeToken
                    ? t("urls.explorers.polygonscan.addresses", { address })
                    : t("urls.explorers.polygonscan.token_transactions", { address, token: tokenAddress })
            }
            variant="primary"
            className="mt-6"
        >
            {t("common.view_more_on_polygonscan")}
        </ButtonLink>
    );
};
