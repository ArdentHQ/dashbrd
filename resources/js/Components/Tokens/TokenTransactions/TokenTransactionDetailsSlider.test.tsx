import { t } from "i18next";
import React from "react";

import { expect } from "vitest";
import { TokenTransactionDetailsSlider } from "./TokenTransactionDetailsSlider";
import * as useAuth from "@/Hooks/useAuth";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { setNativeTokenHandler } from "@/Tests/Mocks/Handlers/nativeToken";
import { render, screen } from "@/Tests/testing-library";
import { ExplorerChains } from "@/Utils/Explorer";

const user = new UserDataFactory().withUSDCurrency().create();
const asset = new TokenListItemDataFactory().create();

const transaction: App.Data.TransactionData = {
    hash: "test",
    isSent: false,
    isErrored: false,
    isPending: false,
    timestamp: 123,
    amount: "0",
    fee: "1084832242734628",
    from: "0x1234567890123456789012345678901234567890",
    to: "0x1231231231231231231231231231231231231231",
    gasPrice: "123456789",
    gasUsed: "123",
    nonce: "1",
};

describe("TokenTransactionDetailsSlider", () => {
    beforeAll(() => {
        vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet: null,
            authenticated: true,
            showAuthOverlay: false,
        });
    });

    beforeEach(() => {
        setNativeTokenHandler();
    });

    it("should render the slider", () => {
        render(
            <TokenTransactionDetailsSlider
                isOpen
                user={user}
                transaction={transaction}
                asset={asset}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByTestId("TokenTransactionDetailsSlider__header")).toBeInTheDocument();

        expect(screen.getByTestId("TokenTransactionDetailsSlider__content")).toBeInTheDocument();
    });

    it("does not render content if transaction does not exist", () => {
        render(
            <TokenTransactionDetailsSlider
                isOpen
                onClose={vi.fn()}
                transaction={undefined}
                asset={asset}
                user={user}
            />,
        );

        expect(screen.getByTestId("TokenTransactionDetailsSlider__header")).toBeInTheDocument();

        expect(screen.queryByTestId("TokenTransactionDetailsSlider__content")).not.toBeInTheDocument();
    });

    it.each([
        ["successful", {}, "TransactionStatus__Confirmed"],
        ["pending", { isPending: true }, "TransactionStatus__Pending"],
        ["errored", { isErrored: true }, "TransactionStatus__Errored"],
    ])("should show the right status for a %s transaction", (_, type, typeId) => {
        render(
            <TokenTransactionDetailsSlider
                isOpen
                onClose={vi.fn()}
                transaction={{ ...transaction, ...type }}
                asset={asset}
                user={user}
            />,
        );

        expect(screen.getByTestId("TokenTransactionDetailsSlider__header")).toBeInTheDocument();

        expect(screen.queryByTestId("TokenTransactionDetailsSlider__content")).toBeInTheDocument();

        expect(screen.queryByTestId(typeId)).toBeInTheDocument();
    });

    it.each([
        ["Polygon", "Ethereum", ExplorerChains.PolygonMainnet],
        ["Ethereum", "Polygon", ExplorerChains.EthereumMainnet],
    ])("should render the %s network", (activeNetwork, inactiveNetwork, chainId) => {
        render(
            <TokenTransactionDetailsSlider
                isOpen
                onClose={vi.fn()}
                transaction={transaction}
                asset={{ ...asset, chain_id: chainId }}
                user={user}
            />,
        );

        expect(screen.getByTestId("TokenTransactionDetailsSlider__header")).toBeInTheDocument();

        expect(screen.queryByTestId("TokenTransactionDetailsSlider__content")).toBeInTheDocument();

        expect(screen.queryAllByTestId(activeNetwork)).toHaveLength(2);
        expect(screen.queryAllByTestId(inactiveNetwork)).toHaveLength(0);
    });

    it.each([
        [t("common.polygonscan"), ExplorerChains.PolygonMainnet],
        [t("common.etherscan"), ExplorerChains.EthereumMainnet],
    ])("should show the right error for the %s network", (explorer, chainId) => {
        render(
            <TokenTransactionDetailsSlider
                isOpen
                onClose={vi.fn()}
                transaction={{ ...transaction, isErrored: true }}
                asset={{ ...asset, chain_id: chainId }}
                user={user}
            />,
        );

        expect(screen.getByTestId("TokenTransactionDetailsSlider__header")).toBeInTheDocument();

        expect(screen.queryByTestId("TokenTransactionDetailsSlider__content")).toBeInTheDocument();

        expect(screen.queryByTestId("TransactionStatus__Errored")).toBeInTheDocument();

        expect(screen.queryByTestId("TransactionStatus__Errored")).toHaveTextContent(explorer as string);
    });

    it("should show a loading skeleton while fetching native token price", () => {
        render(
            <TokenTransactionDetailsSlider
                isOpen
                onClose={vi.fn()}
                transaction={transaction}
                asset={asset}
                user={user}
            />,
        );

        expect(screen.getByTestId("Skeleton")).toBeInTheDocument();
    });

    it("should show transaction fee in native token", async () => {
        render(
            <TokenTransactionDetailsSlider
                isOpen
                onClose={vi.fn()}
                transaction={transaction}
                asset={{ ...asset, chain_id: 137 }}
                user={user}
            />,
        );

        expect(await screen.findByText("0.0011 MATIC")).toBeInTheDocument();
        expect(await screen.findByText(/\$0.01/)).toBeInTheDocument();
    });
});
