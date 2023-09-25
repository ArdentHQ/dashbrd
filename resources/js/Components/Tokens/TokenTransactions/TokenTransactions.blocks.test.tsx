import React from "react";
import {
    ExplorerButton,
    TokenTransactionItem,
    TokenTransactionsTable,
    TransactionDirectionIcon,
    TransactionStatusBadge,
} from ".";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { render, screen } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";
import { type ExplorerChains } from "@/Utils/Explorer";

const user = new UserDataFactory().withUSDCurrency().create();

const transaction: App.Data.TransactionData = {
    hash: "test",
    isSent: false,
    isErrored: false,
    isPending: false,
    timestamp: 123,
    amount: "0",
    fee: "0",
    from: "0x1234567890123456789012345678901234567890",
    to: "0x1231231231231231231231231231231231231231",
    gasPrice: "123456789",
    gasUsed: "123",
    nonce: "1",
};

const asset = new TokenListItemDataFactory().create();

describe("TransactionDirectionIcon", () => {
    it("should render", () => {
        render(
            <TransactionDirectionIcon
                transaction={{
                    ...transaction,
                    isErrored: true,
                }}
            />,
        );

        render(
            <TransactionDirectionIcon
                transaction={{
                    ...transaction,
                    isSent: true,
                }}
            />,
        );

        render(
            <TransactionDirectionIcon
                transaction={{
                    ...transaction,
                    isSent: false,
                    isErrored: false,
                }}
            />,
        );
    });
});

describe("TransactionStatusBadge", () => {
    it("should render", () => {
        render(
            <TransactionStatusBadge
                transaction={{
                    ...transaction,
                    isPending: true,
                }}
            />,
        );

        render(
            <TransactionStatusBadge
                transaction={{
                    ...transaction,
                    isErrored: true,
                }}
            />,
        );

        render(
            <TransactionStatusBadge
                transaction={{
                    ...transaction,
                    isPending: false,
                    isErrored: false,
                }}
            />,
        );
    });
});

describe("TokenTransactionItem", () => {
    it("should render", () => {
        render(
            <table>
                <tbody>
                    <TokenTransactionItem
                        transaction={transaction}
                        user={user}
                        asset={asset}
                    />
                </tbody>
            </table>,
        );

        render(
            <table>
                <tbody>
                    <TokenTransactionItem
                        transaction={{
                            ...transaction,
                            isSent: true,
                        }}
                        user={user}
                        asset={asset}
                    />
                </tbody>
            </table>,
        );
    });

    it("should render with an onClick", () => {
        render(
            <table>
                <tbody>
                    <TokenTransactionItem
                        transaction={transaction}
                        user={user}
                        asset={asset}
                    />
                </tbody>
            </table>,
        );

        render(
            <table>
                <tbody>
                    <TokenTransactionItem
                        transaction={{
                            ...transaction,
                            isSent: true,
                        }}
                        user={user}
                        asset={asset}
                    />
                </tbody>
            </table>,
        );
    });
});

describe("TokenTransactionsTable", () => {
    it.each([Breakpoint.xs, Breakpoint.lg])("should render empty on %s screen", (breakpoint) => {
        render(
            <TokenTransactionsTable
                transactions={[]}
                user={user}
                asset={asset}
            />,
            { breakpoint },
        );

        expect(screen.getByTestId("TokenTransactionsTable")).toBeInTheDocument();
    });

    it.each([Breakpoint.xs, Breakpoint.lg])("should render with transactions on %s screen", (breakpoint) => {
        render(
            <TokenTransactionsTable
                transactions={[transaction]}
                user={user}
                asset={asset}
            />,
            { breakpoint },
        );

        expect(screen.getByTestId("TokenTransactionsTable")).toBeInTheDocument();
        expect(screen.getByTestId("TokenTransactionItem__row")).toBeInTheDocument();
    });

    it.each([Breakpoint.xs, Breakpoint.lg])("should render loading skeleton on %s screen", (breakpoint) => {
        render(
            <TokenTransactionsTable
                isLoading
                transactions={[]}
                user={user}
                asset={asset}
            />,
            { breakpoint },
        );

        expect(screen.getByTestId("TokenTransactionsTableSkeleton")).toBeInTheDocument();
    });
});

describe("ExplorerButton", () => {
    it("should render for etherscan", () => {
        render(
            <ExplorerButton
                chainId={1}
                address="1"
                tokenAddress="test"
            />,
        );

        expect(screen.getByTestId("ExplorerButton")).toHaveProperty("href", "https://etherscan.io/token/test?a=1");
    });

    it("should render for etherscan for native token", () => {
        render(
            <ExplorerButton
                chainId={1}
                address="1"
                tokenAddress="test"
                isNativeToken
            />,
        );

        expect(screen.getByTestId("ExplorerButton")).toHaveProperty("href", "https://etherscan.io/address/1");
    });

    it("should render for polygonscan", () => {
        render(
            <ExplorerButton
                chainId={137}
                address="1"
                tokenAddress="test"
            />,
        );

        expect(screen.getByTestId("ExplorerButton")).toBeInTheDocument();
    });

    it("should render for polygonscan for native token", () => {
        render(
            <ExplorerButton
                chainId={137}
                address="1"
                tokenAddress="test"
                isNativeToken
            />,
        );

        expect(screen.getByTestId("ExplorerButton")).toHaveProperty("href", "https://polygonscan.com/address/1");
    });

    it("should not render for unknown chain", () => {
        render(
            <ExplorerButton
                chainId={10000 as ExplorerChains.EthereumMainnet}
                address="1"
                tokenAddress="test"
            />,
        );

        expect(screen.queryByTestId("ExplorerButton")).not.toBeInTheDocument();
    });
});
