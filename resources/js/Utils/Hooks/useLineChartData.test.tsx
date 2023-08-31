import { render, screen, waitFor } from "@/Tests/testing-library";
import * as ApiMock from "@/Utils/api";
import { useLineChartData, WithLineChartData } from "@/Utils/Hooks/useLineChartData";

const TestComponent = (): JSX.Element => {
    const { loadedSymbols, errored } = useLineChartData();

    if (loadedSymbols.length === 0) {
        return <div data-testid="TestComponent__loading"></div>;
    }

    if (errored) {
        return <div data-testid="TestComponent__errored"></div>;
    }

    return <div></div>;
};

describe("WithLineChartData", () => {
    it("should setup context & load the data", async () => {
        const getLineChartPriceHistorySpy = vi.spyOn(ApiMock, "getLineChartPriceHistory").mockResolvedValue({});

        render(
            <WithLineChartData
                currency="USD"
                symbols={["ETH"]}
            >
                <TestComponent />
            </WithLineChartData>,
        );

        expect(screen.getByTestId("TestComponent__loading")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TestComponent__loading")).not.toBeInTheDocument();
        });

        expect(getLineChartPriceHistorySpy).toHaveBeenCalledTimes(1);

        getLineChartPriceHistorySpy.mockRestore();
    });

    it("loads more data", async () => {
        let getLineChartPriceHistorySpy = vi.spyOn(ApiMock, "getLineChartPriceHistory").mockResolvedValueOnce({
            ETH: [
                {
                    timestamp: 1,
                    price: 1,
                },
            ],
        });

        const { rerender } = render(
            <WithLineChartData
                currency="USD"
                symbols={["ETH"]}
            >
                <TestComponent />
            </WithLineChartData>,
        );

        expect(screen.getByTestId("TestComponent__loading")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TestComponent__loading")).not.toBeInTheDocument();
        });

        expect(getLineChartPriceHistorySpy).toHaveBeenCalled();

        getLineChartPriceHistorySpy.mockRestore();

        getLineChartPriceHistorySpy = vi.spyOn(ApiMock, "getLineChartPriceHistory").mockResolvedValueOnce({
            MATIC: [
                {
                    timestamp: 2,
                    price: 2,
                },
            ],
        });

        rerender(
            <WithLineChartData
                currency="USD"
                symbols={["ETH", "MATIC"]}
            >
                <TestComponent />
            </WithLineChartData>,
        );

        expect(screen.getByTestId("TestComponent__loading")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TestComponent__loading")).not.toBeInTheDocument();
        });

        expect(getLineChartPriceHistorySpy).toHaveBeenCalled();

        getLineChartPriceHistorySpy.mockRestore();
    });

    it("should not load anything if currency is empty", () => {
        render(
            <WithLineChartData
                currency=""
                symbols={["ETH"]}
            >
                <TestComponent />
            </WithLineChartData>,
        );

        expect(screen.queryByTestId("TestComponent__loading")).toBeInTheDocument();
    });
    it("should not load anything if no symbols", () => {
        render(
            <WithLineChartData
                currency="USD"
                symbols={[]}
            >
                <TestComponent />
            </WithLineChartData>,
        );

        expect(screen.queryByTestId("TestComponent__loading")).toBeInTheDocument();
    });

    it("should handle loading errores", () => {
        const getLineChartPriceHistorySpy = vi.spyOn(ApiMock, "getLineChartPriceHistory").mockImplementation(() => {
            throw new Error("Something went wrong");
        });

        render(
            <WithLineChartData
                currency="USD"
                symbols={["ETH"]}
            >
                <TestComponent />
            </WithLineChartData>,
        );

        expect(screen.getByTestId("TestComponent__errored")).toBeInTheDocument();

        getLineChartPriceHistorySpy.mockRestore();
    });
});

describe("useLineChartData", () => {
    it("should throw error if not in context", () => {
        const originalError = console.error;
        console.error = vi.fn();

        const Component = (): JSX.Element => {
            useLineChartData();

            return <div></div>;
        };

        expect(() => render(<Component />)).toThrowError("useLineChartData must be within WithLineChartData");

        console.error = originalError;
    });
});
