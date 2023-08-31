import React from "react";
import { mockViewportVisibilitySensor } from "vitest.setup";
import { WalletTokensTable } from "@/Components/WalletTokens/WalletTokensTable";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import TokenTransactionsFixture from "@/Tests/Fixtures/token_transactions.json";
import { setNativeTokenHandler } from "@/Tests/Mocks/Handlers/nativeToken";
import { BASE_URL, requestMock, server } from "@/Tests/Mocks/server";
import { useTransactionSliderContextSpy } from "@/Tests/Spies/useTransactionSliderContextSpy";
import { render, screen, userEvent } from "@/Tests/testing-library";
import { allBreakpoints, Breakpoint } from "@/Tests/utils";
import * as useLineChartDataMock from "@/Utils/Hooks/useLineChartData";
vi.mock("@/Components/Graphs/LineChart/LineChart");

const tokenCell = "WalletTokensTable__token";
const balanceCell = "WalletTokensTable__balance";
const priceCell = "WalletTokensTable__price";
const marketCapCell = "WalletTokensTable__market-cap";
const volumeCell = "WalletTokensTable__volume";
const chartCell = "WalletTokensTable__chart";
const priceChart = "PriceChart__container";
const user = new UserDataFactory().create();
const wallet = new WalletFactory().create();

describe("WalletTokensTable", () => {
    useTransactionSliderContextSpy();

    beforeEach(() => {
        server.use(requestMock(`${BASE_URL}/price_history`, []));
        server.use(requestMock(`${BASE_URL}/line_chart_data`, []));
        server.use(
            requestMock("https://api.etherscan.io/api", TokenTransactionsFixture, {
                method: "get",
            }),
        );

        server.use(
            requestMock(
                `${BASE_URL}/tokens/show`,
                {},
                {
                    status: 500,
                },
            ),
        );

        setNativeTokenHandler();
    });

    const assets = [
        new TokenListItemDataFactory().create({
            symbol: "BRDY",
            chain_id: 1,
        }),
    ];

    it.each([
        [[]],
        [assets],
        [
            new TokenListItemDataFactory().createMany(20, {
                chain_id: 1,
            }),
        ],
    ])("should render assets", (givenAssets) => {
        render(
            <WalletTokensTable
                tokens={givenAssets}
                currency="USD"
                user={user}
                wallet={wallet}
            />,
        );
        expect(screen.getAllByRole("row")).toHaveLength(givenAssets.length + 1);
    });

    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        vi.spyOn(useLineChartDataMock, "useLineChartData").mockReturnValue({
            chartData: {},
            loadedSymbols: ["BRDY"],
            errored: false,
        });

        render(
            <WalletTokensTable
                tokens={[assets[0]]}
                currency="USD"
                user={user}
                wallet={wallet}
            />,
            { breakpoint },
        );

        switch (breakpoint) {
            case "xs":
                expect(screen.getByTestId(tokenCell)).toBeInTheDocument();
                expect(screen.getByTestId(balanceCell)).toBeInTheDocument();
                expect(screen.queryByTestId(priceCell)).not.toBeInTheDocument();
                expect(screen.queryByTestId(marketCapCell)).not.toBeInTheDocument();
                expect(screen.queryByTestId(volumeCell)).not.toBeInTheDocument();
                expect(screen.queryByTestId(chartCell)).not.toBeInTheDocument();
                expect(screen.queryByTestId(priceChart)).not.toBeInTheDocument();
                expect(screen.queryByRole("button", { name: "Details" })).not.toBeInTheDocument();
                break;

            case "sm":
            case "md":
                expect(screen.getByTestId(tokenCell)).toBeInTheDocument();
                expect(screen.getByTestId(balanceCell)).toBeInTheDocument();
                expect(screen.getByTestId(priceCell)).toBeInTheDocument();
                expect(screen.queryByTestId(marketCapCell)).not.toBeInTheDocument();
                expect(screen.queryByTestId(volumeCell)).not.toBeInTheDocument();
                expect(screen.queryByTestId(chartCell)).not.toBeInTheDocument();
                expect(screen.queryByTestId(priceChart)).not.toBeInTheDocument();
                expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
                break;

            case "lg":
                expect(screen.getByTestId(tokenCell)).toBeInTheDocument();
                expect(screen.getByTestId(balanceCell)).toBeInTheDocument();
                expect(screen.getByTestId(priceCell)).toBeInTheDocument();
                expect(screen.getByTestId(marketCapCell)).toBeInTheDocument();
                expect(screen.queryByTestId(volumeCell)).not.toBeInTheDocument();
                expect(screen.getByTestId(chartCell)).toBeInTheDocument();
                expect(screen.getByTestId(priceChart)).toBeInTheDocument();
                expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
                break;

            case "xl":
                expect(screen.getByTestId(tokenCell)).toBeInTheDocument();
                expect(screen.getByTestId(balanceCell)).toBeInTheDocument();
                expect(screen.getByTestId(priceCell)).toBeInTheDocument();
                expect(screen.getByTestId(marketCapCell)).toBeInTheDocument();
                expect(screen.getByTestId(volumeCell)).toBeInTheDocument();
                expect(screen.getByTestId(chartCell)).toBeInTheDocument();
                expect(screen.getByTestId(priceChart)).toBeInTheDocument();
                expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
                break;

            default:
                break;
        }
    });

    it.each(allBreakpoints)("should render loading skeleton with 5 items in %s screen", (breakpoint) => {
        render(
            <WalletTokensTable
                isLoading
                tokens={[assets[0]]}
                currency="USD"
                user={user}
                wallet={wallet}
            />,
            { breakpoint },
        );

        if (breakpoint !== Breakpoint.xs) {
            expect(screen.getAllByTestId("WalletTokensTableItemSkeleton")).toHaveLength(5);
        } else {
            expect(screen.getAllByTestId("WalletTokensTableItemSkeletonMobile")).toHaveLength(5);
        }
    });

    it("should open and close the details slider", async () => {
        render(
            <WalletTokensTable
                wallet={wallet}
                tokens={[assets[0]]}
                currency="USD"
                user={user}
            />,
        );

        expect(screen.getByTestId("WalletTokensTable__action_details")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("WalletTokensTable__action_details"));

        expect(screen.getByTestId("TokenDetailsSlider")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Slider__closeButton_desktop"));

        expect(screen.queryByTestId("TokenDetailsSlider")).not.toBeInTheDocument();
    });

    it("should open and close the details slider from responsive item", async () => {
        render(
            <WalletTokensTable
                wallet={wallet}
                tokens={[assets[0]]}
                currency="USD"
                user={user}
            />,
            { breakpoint: "xs" as Breakpoint },
        );

        await userEvent.click(screen.getByRole("button"));

        expect(screen.getByTestId("TokenDetailsSlider")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Slider__closeButton_mobile"));

        expect(screen.queryByTestId("TokenDetailsSlider")).not.toBeInTheDocument();
    });

    it("should emit loadMore if viewing last items", () => {
        const onLoadMoreMock = vi.fn();

        mockViewportVisibilitySensor({
            inViewport: true,
        });

        const tokens = new TokenListItemDataFactory().createMany(20, {
            chain_id: 1,
        });

        render(
            <WalletTokensTable
                wallet={wallet}
                tokens={tokens}
                currency="USD"
                user={user}
                onLoadMore={onLoadMoreMock}
            />,
        );

        expect(onLoadMoreMock).toHaveBeenCalled();
    });
});
