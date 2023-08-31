import { type Chart } from "chart.js";
import { usePriceChart } from "./usePriceChart";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("usePriceChart", () => {
    const values = [10, 15, 11];

    const chartFixture = {
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animations: { tension: { duration: 500, easing: "linear" } },
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                y: {
                    max: 15,
                    min: 9,
                },
            },
        },
        data: {
            datasets: [
                {
                    borderColor: "rgba(196, 200, 207, 1)",
                    data: values,
                    pointRadius: 0,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.25,
                },
            ],
            labels: [],
        },
        update: vi.fn(),
    };

    const Component = ({ chart, values }: { values: number[]; chart: Chart<"line"> }): JSX.Element => {
        const { updateChartData } = usePriceChart();

        return (
            <div>
                <button
                    onClick={() => {
                        updateChartData({
                            chart,
                            isPlaceholder: false,
                            datasets: chartFixture.data.datasets,
                            values,
                            labels: [],
                        });
                    }}
                    data-testid="button"
                >
                    Update
                </button>
            </div>
        );
    };

    it("should handle negative values", async () => {
        const chart = chartFixture as unknown as Chart<"line">;
        render(
            <Component
                chart={chart}
                values={[50, 25, 10]}
            />,
        );

        await userEvent.click(screen.getByTestId("button"));

        expect(chart.options.scales?.y?.min).toEqual(7.5);
        expect(chart.options.scales?.y?.max).toEqual(52.5);
    });

    it("should set y axis boundaries", async () => {
        const chart = chartFixture as unknown as Chart<"line">;
        render(
            <Component
                chart={chart}
                values={values}
            />,
        );

        await userEvent.click(screen.getByTestId("button"));

        expect(chart.options.scales?.y?.min).toEqual(9.25);
        expect(chart.options.scales?.y?.max).toEqual(15.75);
    });

    it("should handle chart without y axis", async () => {
        const chart = chartFixture as unknown as Chart<"line">;

        render(
            <Component
                chart={
                    {
                        ...chart,
                        options: {
                            scales: {
                                y: undefined,
                            },
                        },
                    } as unknown as Chart<"line">
                }
                values={values}
            />,
        );

        await userEvent.click(screen.getByTestId("button"));

        expect(chartFixture.options.scales.y.min).toBeDefined();
        expect(chartFixture.options.scales.y.max).toBeDefined();
    });

    it("should handle chart without any data", async () => {
        const chart = chartFixture as unknown as Chart<"line">;

        render(
            <Component
                chart={
                    {
                        ...chart,
                        data: {
                            datasets: [
                                {
                                    borderColor: "red",
                                    data: [],
                                },
                            ],
                        },
                    } as unknown as Chart<"line">
                }
                values={values}
            />,
        );

        await userEvent.click(screen.getByTestId("button"));

        expect(chartFixture.data.datasets[0].data.length).toEqual(3);
    });
});
