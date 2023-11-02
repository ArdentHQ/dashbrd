import React from "react";
import { TokenPriceChart } from "./TokenPriceChart";
import { Period } from "@/Components/Tokens/Tokens.contracts";
import * as useDarkModeContext from "@/Contexts/DarkModeContext";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { mockAuthContext, render, screen, waitFor } from "@/Tests/testing-library";

const user = new UserDataFactory().create();
const wallet = new WalletFactory().create();

const testToken = new TokenListItemDataFactory().create();

const priceHistoryDataMock: App.Data.PriceHistoryData[] = [
    {
        timestamp: 1678991401469,
        price: 100.1,
    },
    {
        timestamp: 1678991401480,
        price: 200.5,
    },
];

let resetAuthContext: () => void;

describe("TokenPriceChart", () => {
    beforeEach(() => {
        vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        resetAuthContext = mockAuthContext({
            user,
            wallet,
        });
    });

    afterEach(() => {
        resetAuthContext();
        vi.restoreAllMocks();
    });

    it("should render the chart", async () => {
        server.use(requestMockOnce(`${BASE_URL}/price_history`, priceHistoryDataMock, { method: "post" }));

        render(
            <TokenPriceChart
                period={Period.DAY}
                token={testToken}
            />,
        );

        expect(screen.getByTestId("TokenPriceChart")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TokenPriceChart__loading")).not.toBeInTheDocument();
            expect(screen.getByTestId("TokenPriceChart__chart")).toBeInTheDocument();
        });
    });

    it("should handle gradient tick", async () => {
        server.use(requestMockOnce(`${BASE_URL}/price_history`, priceHistoryDataMock, { method: "post" }));

        render(
            <TokenPriceChart
                period={Period.DAY}
                token={testToken}
            />,
        );

        expect(screen.getByTestId("TokenPriceChart")).toBeInTheDocument();

        // This is to force await the nextick in TokenPriceChart.tsx for setting the gradient code, which takes 10ms
        await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 15)));

        await waitFor(() => {
            expect(screen.queryByTestId("TokenPriceChart__loading")).not.toBeInTheDocument();
            expect(screen.getByTestId("TokenPriceChart__chart")).toBeInTheDocument();
        });
    });

    it("should handle request exception", async () => {
        server.use(
            requestMockOnce(`${BASE_URL}/price_history`, priceHistoryDataMock, {
                status: 500,
                method: "post",
            }),
        );

        render(
            <TokenPriceChart
                period={Period.DAY}
                token={testToken}
            />,
        );

        expect(screen.getByTestId("TokenPriceChart")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TokenPriceChart__loading")).not.toBeInTheDocument();
            expect(screen.getByTestId("TokenPriceChart__error")).toBeInTheDocument();
        });
    });

    it("should render the chart with empty set of values", async () => {
        server.use(requestMockOnce(`${BASE_URL}/price_history`, [], { method: "post" }));

        render(
            <TokenPriceChart
                period={Period.DAY}
                token={testToken}
            />,
        );

        expect(screen.getByTestId("TokenPriceChart")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TokenPriceChart__loading")).not.toBeInTheDocument();
            expect(screen.getByTestId("TokenPriceChart__chart")).toBeInTheDocument();
        });
    });

    it("should contain data and options", async () => {
        server.use(requestMockOnce(`${BASE_URL}/price_history`, priceHistoryDataMock, { method: "post" }));

        render(
            <TokenPriceChart
                period={Period.DAY}
                token={testToken}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toHaveTextContent(`"labels":[0,1]`);
        });

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toHaveTextContent(`"data":[100.1,200.5]`);
        });

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toHaveTextContent(
                `"scales":{"y":{"suggestedMax":200.5`,
            );
        });
    });

    it('should change pointHoverBorderColor to "#3D444D" when dark mode is enabled', async () => {
        vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({ isDark: true, toggleDarkMode: vi.fn() });

        server.use(requestMockOnce(`${BASE_URL}/price_history`, priceHistoryDataMock, { method: "post" }));

        render(
            <TokenPriceChart
                period={Period.DAY}
                token={testToken}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toHaveTextContent(`"pointHoverBorderColor":"#3D444D"`);
        });
    });

    it("changes the data for a new period", async () => {
        server.use(
            requestMockOnce(`${BASE_URL}/price_history`, priceHistoryDataMock, { method: "post" }),
            requestMockOnce(
                `${BASE_URL}/price_history`,
                [
                    {
                        timestamp: 1678991401400,
                        price: 300,
                    },
                ],
                { method: "post" },
            ),
        );

        const { rerender } = render(
            <TokenPriceChart
                period={Period.DAY}
                token={testToken}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toHaveTextContent(`"data":[100.1,200.5]`);
        });

        rerender(
            <TokenPriceChart
                period={Period.WEEK}
                token={testToken}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("TokenPriceChart__chart")).toHaveTextContent(`"data":[300]`);
        });
    });
});
