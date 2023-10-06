import React from "react";
import { Action, Balance, Chart, Price, Token } from "@/Components/WalletTokens/WalletTokensTable.blocks";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";
import { Breakpoint } from "@/Tests/utils";
import { WithLineChartData } from "@/Utils/Hooks/useLineChartData";

const asset = new TokenListItemDataFactory().create({
    name: "BRDY TOKEN",
    symbol: "BRDY",
    decimals: 18,
    balance: (123 * 1e18).toString(),
    fiat_balance: "321",
});

describe("Token Cell", () => {
    it("should render token with name and symbol", () => {
        render(<Token asset={asset} />);

        expect(screen.queryByRole("button")).not.toBeInTheDocument();

        expect(screen.getByTestId("WalletTokensTable__token")).toBeInTheDocument();

        expect(screen.getByTestId("WalletTokensTable__token_symbol")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__token_symbol")).toHaveTextContent("BRDY");

        expect(screen.getByTestId("WalletTokensTable__token_name")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__token_name")).toHaveTextContent("BRDY TOKEN");
    });

    it("should execute onClick callback", async () => {
        const clickSpy = vi.fn();

        render(
            <Token
                asset={asset}
                onClick={clickSpy}
            />,
        );

        expect(screen.getByRole("button")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("WalletTokensTable__token"));

        expect(clickSpy).toHaveBeenCalled();
    });
});

describe("Balance Cell", () => {
    it("should render balance with fiat and crypto values", () => {
        render(
            <Balance
                asset={asset}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("WalletTokensTable__balance")).toBeInTheDocument();

        expect(screen.getByTestId("WalletTokensTable__balance_fiat")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__balance_fiat")).toHaveTextContent("$321.00");

        expect(screen.getByTestId("WalletTokensTable__balance_crypto")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__balance_crypto")).toHaveTextContent("123 BRDY");
    });
});

describe("Price Cell", () => {
    it("should render with token price", () => {
        const asset = new TokenListItemDataFactory().create({
            token_price: "1234567",
        });

        render(
            <Price
                asset={asset}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("WalletTokensTable__price_fiat")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__price_fiat")).toHaveTextContent("$1,234,567.00");
    });

    it("should render without token price", () => {
        const asset = new TokenListItemDataFactory().create({
            token_price: null,
        });

        render(
            <Price
                asset={asset}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("WalletTokensTable__price_fiat")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__price_fiat")).toHaveTextContent("$0");
    });

    it("should render without fiat balance", () => {
        const asset = new TokenListItemDataFactory().create({
            fiat_balance: null,
        });

        render(
            <Balance
                asset={asset}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("WalletTokensTable__balance_fiat")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__balance_fiat")).toHaveTextContent("$0.00");
    });

    it.each([
        [null, null, "0.00%"],
        [null, "25", "-100.00%"],
        ["150", "25", "+20.00%"],
        ["150", "-25", "-14.29%"],
    ])("should calculate price change percentage", (tokenPrice, change, result) => {
        const asset = new TokenListItemDataFactory().create({
            token_price: tokenPrice,
            price_change_24h_in_currency: change,
        });

        render(
            <Price
                asset={asset}
                currency="USD"
            />,
        );

        expect(screen.getByText(result)).toBeInTheDocument();
    });
});

describe("Action Cell", () => {
    it.each(["sm", "md"] as Breakpoint[])("should trigger onClick callback", async (breakpoint) => {
        const clickMock = vi.fn();

        render(
            <Action
                asset={asset}
                onClick={clickMock}
            />,
            { breakpoint },
        );

        if (breakpoint === Breakpoint.sm) {
            await userEvent.click(screen.getByTestId("WalletTokensTable__action_details"));
        }

        if (breakpoint === Breakpoint.md) {
            await userEvent.click(screen.getByTestId("WalletTokensTable__action_details_small"));
        }

        expect(clickMock).toHaveBeenCalled();
    });
});

describe("Chart Cell", () => {
    const priceHistoryDataMock: Record<string, App.Data.PriceHistoryData[]> = {
        [asset.symbol]: [
            {
                timestamp: 1678991401469,
                price: 100.1,
            },
            {
                timestamp: 1678991401480,
                price: 200.5,
            },
        ],
    };

    it("renders the chart", async () => {
        server.use(requestMockOnce(`${BASE_URL}/line_chart_data`, priceHistoryDataMock, { method: "post" }));
        render(
            <WithLineChartData
                currency="USD"
                symbols={[asset.symbol]}
            >
                <Chart
                    asset={asset}
                    currency="USD"
                />
            </WithLineChartData>,
        );

        await waitFor(() => {
            expect(screen.queryByTestId("Skeleton")).not.toBeInTheDocument();
        });

        expect(screen.getByTestId("WalletTokensTable__chart")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__chart").getAttribute("data-testerrored")).toBe("false");
    });

    it("renders the chart if no data for the symbol", async () => {
        server.use(requestMockOnce(`${BASE_URL}/line_chart_data`, {}, { method: "post" }));

        render(
            <WithLineChartData
                currency="USD"
                symbols={[asset.symbol]}
            >
                <Chart
                    asset={asset}
                    currency="USD"
                />
            </WithLineChartData>,
        );

        await waitFor(() => {
            expect(screen.queryByTestId("Skeleton")).not.toBeInTheDocument();
        });

        expect(screen.getByTestId("WalletTokensTable__chart")).toBeInTheDocument();
        expect(screen.getByTestId("WalletTokensTable__chart").getAttribute("data-testerrored")).toBe("true");
    });

    it("still renders the chart if error", async () => {
        server.use(
            requestMockOnce(
                `${BASE_URL}/line_chart_data`,
                { [asset.symbol]: [] },
                {
                    status: 500,
                    method: "post",
                },
            ),
        );

        render(
            <WithLineChartData
                currency="USD"
                symbols={[asset.symbol]}
            >
                <Chart
                    asset={asset}
                    currency="USD"
                />
            </WithLineChartData>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("WalletTokensTable__chart").getAttribute("data-testerrored")).toBe("true");
        });

        expect(screen.getByTestId("WalletTokensTable__chart")).toBeInTheDocument();
    });
});
