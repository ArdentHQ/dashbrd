import React from "react";
import { expect } from "vitest";
import { TokenTransactions } from ".";
import MetaMaskContextProvider from "@/Contexts/MetaMaskContext";
import * as useTransactionSliderContext from "@/Contexts/TransactionSliderContext";
import * as useExplorer from "@/Hooks/useExplorer";
import * as useIsFirstRender from "@/Hooks/useIsFirstRender";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import TokenTransactionsFixture from "@/Tests/Fixtures/token_transactions.json";
import { setNativeTokenHandler } from "@/Tests/Mocks/Handlers/nativeToken";
import { requestMock, server } from "@/Tests/Mocks/server";
import { initialState, useTransactionSliderContextSpy } from "@/Tests/Spies/useTransactionSliderContextSpy";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";

const user = new UserDataFactory().create();
const wallet = new WalletFactory().create();

const auth: App.Data.AuthData = {
    user,
    wallet,
    authenticated: true,
    signed: false,
};

describe("TokenTransactions", () => {
    const asset = new TokenListItemDataFactory().create({
        chain_id: 137,
        is_native_token: true,
    });

    useTransactionSliderContextSpy();

    beforeEach(() => {
        server.use(
            requestMock("https://api.polygonscan.com/api", TokenTransactionsFixture, {
                method: "get",
            }),
        );

        setNativeTokenHandler();
    });

    it("should render error state", async () => {
        server.use(
            requestMock("https://api.polygonscan.com/api", () => {
                throw new Error("test");
            }),
        );

        render(
            <TokenTransactions
                user={user}
                asset={asset}
                wallet={auth.wallet}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("ExplorerButton")).toBeInTheDocument();
        });

        expect(screen.getByTestId("TokenTransactions__error")).toBeInTheDocument();
    });

    it.each([Breakpoint.lg])("should render in %s screen", async (breakpoint) => {
        render(
            <MetaMaskContextProvider initialAuth={auth}>
                <TokenTransactions
                    user={user}
                    asset={asset}
                    wallet={auth.wallet}
                />
            </MetaMaskContextProvider>,
            { breakpoint },
        );

        await waitFor(() => {
            expect(screen.getByTestId("ExplorerButton")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getAllByTestId("TokenTransactionItem")).toHaveLength(10);
        });

        expect(screen.queryByTestId("TokenTransactions__error")).not.toBeInTheDocument();
    });

    it("should render for native token", async () => {
        const asset = new TokenListItemDataFactory().create({
            chain_id: 137,
            is_native_token: true,
        });

        render(
            <MetaMaskContextProvider initialAuth={auth}>
                <TokenTransactions
                    user={user}
                    asset={asset}
                    wallet={auth.wallet}
                />
            </MetaMaskContextProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("ExplorerButton")).toBeInTheDocument();
        });
    });

    it("should render for non native token", async () => {
        const asset = new TokenListItemDataFactory().create({
            chain_id: 137,
            is_native_token: false,
        });

        render(
            <MetaMaskContextProvider initialAuth={auth}>
                <TokenTransactions
                    user={user}
                    asset={asset}
                    wallet={auth.wallet}
                />
            </MetaMaskContextProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("ExplorerButton")).toBeInTheDocument();
        });
    });

    it("should render empty", async () => {
        render(
            <TokenTransactions
                user={user}
                asset={asset}
                wallet={auth.wallet}
            />,
        );

        expect(screen.getByTestId("TokenTransactions")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TokenTransactionItem")).not.toBeInTheDocument();
        });

        expect(screen.queryByTestId("TokenTransactions__view")).not.toBeInTheDocument();
    });

    it("should render server-loading skeleton", async () => {
        render(
            <TokenTransactions
                user={user}
                asset={asset}
                wallet={auth.wallet}
            />,
        );

        expect(screen.getByTestId("TokenTransactions")).toBeInTheDocument();
        expect(screen.getByTestId("TokenTransactionsTableSkeleton")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("ExplorerButton")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getAllByTestId("TokenTransactionItem")).toHaveLength(10);
        });
    });

    it("should render the 'View more' button if there are more items to load", async () => {
        render(
            <TokenTransactions
                user={user}
                asset={asset}
                wallet={auth.wallet}
            />,
        );

        expect(screen.getByTestId("TokenTransactions")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("ExplorerButton")).toBeInTheDocument();
        });
    });

    it("should not fetch transactions if auth wallet is not provided", () => {
        render(
            <TokenTransactions
                user={user}
                asset={asset}
                wallet={null}
            />,
        );

        expect(screen.getByTestId("EmptyBlock")).toBeInTheDocument();
        expect(screen.queryAllByTestId("TokenTransactionItem")).toHaveLength(0);
    });

    it("should be able to open and close the transaction details slider", async () => {
        render(
            <TokenTransactions
                user={user}
                asset={asset}
                wallet={auth.wallet}
            />,
        );

        expect(screen.getByTestId("TokenTransactions")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByTestId("TokenTransactionItem")).toHaveLength(10);
        });

        await waitFor(() => {
            expect(screen.getByTestId("ExplorerButton")).toBeInTheDocument();
        });

        await userEvent.click(screen.getAllByTestId("TokenTransactionItem__row")[0]);

        expect(screen.queryByTestId("TokenTransactionDetailsSlider__header")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("SliderFormActionsToolbar__cancel"));

        expect(screen.queryByTestId("TokenTransactionDetailsSlider__header")).not.toBeInTheDocument();
    });

    it("should re-fetch transactions when a new transaction made", () => {
        const sliderSpy = vi.spyOn(useTransactionSliderContext, "useTransactionSliderContext").mockReturnValue({
            ...initialState,
            lastTransaction: {
                address: asset.address,
                hash: "0xhash",
            },
        });

        const fetchTransactionsMock = vi.fn();

        const explorerSpy = vi.spyOn(useExplorer, "useExplorer").mockReturnValue({
            fetchTransactions: fetchTransactionsMock,
            transactions: [],
            isLoading: false,
            hasMore: false,
            error: undefined,
        });

        const renderSpy = vi.spyOn(useIsFirstRender, "useIsFirstRender").mockReturnValue(false);

        render(
            <TokenTransactions
                user={user}
                asset={asset}
                wallet={auth.wallet}
            />,
        );

        expect(fetchTransactionsMock).toHaveBeenCalledTimes(1);

        sliderSpy.mockRestore();
        explorerSpy.mockRestore();
        renderSpy.mockRestore();
    });
});
