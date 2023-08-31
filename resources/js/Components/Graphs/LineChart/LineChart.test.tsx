import { type ChartData, type ChartDataset, type Point } from "chart.js";
import { enUS } from "date-fns/locale";
import React, { useRef } from "react";
import { type LineChartProperties } from "./LineChart.contracts";
import { LineChart } from "@/Components/Graphs/LineChart/LineChart";
import { render, screen, waitFor } from "@/Tests/testing-library";

describe("LineChart", () => {
    const values = [10, 15, 11];

    const datasets: Array<ChartDataset<"line", Array<number | Point | null>>> = [
        {
            borderColor: "rgba(196, 200, 207, 1)",
            data: values,
            pointRadius: 0,
            borderWidth: 2,
            fill: false,
            tension: 0.25,
        },
    ];

    const fixture = {
        data: {
            labels: Object.keys(values),
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animations: {
                tension: {
                    duration: 500,
                    easing: "linear",
                },
            },
            plugins: {
                legend: {
                    display: true,
                },
                tooltip: {
                    enabled: true,
                },
            },
            scales: {
                x: {
                    time: {
                        unit: "hour",
                    },
                    adapters: {
                        date: {
                            locale: enUS,
                        },
                    },
                    ticks: {
                        display: true,
                    },
                    grid: {
                        display: true,
                        tickLength: 0,
                    },
                    border: {
                        display: true,
                    },
                },
                y: {
                    max: 15 + 15 * 0.05,
                    min: 10 - 15 * 0.05,
                    ticks: {
                        display: true,
                    },
                    grid: {
                        display: true,
                        tickLength: 0,
                    },
                    border: {
                        display: true,
                    },
                },
            },
        },
    };

    const Component = (properties: LineChartProperties): JSX.Element => {
        const reference = useRef();

        return (
            <LineChart
                reference={reference}
                {...properties}
            />
        );
    };

    const data: ChartData<"line"> = {
        labels: Object.keys(values),
        datasets,
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render", async () => {
        render(<Component data={data} />);

        await waitFor(() => {
            expect(screen.getByTestId("LineChart")).toHaveTextContent(JSON.stringify(fixture));
        });
    });

    it("should hide grid", async () => {
        render(
            <Component
                data={data}
                hideGrid={true}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("LineChart")).toHaveTextContent(
                JSON.stringify({
                    ...fixture,
                    options: {
                        ...fixture.options,
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false },
                        },
                        scales: {
                            x: {
                                ...fixture.options.scales.x,
                                ticks: { display: false },
                                grid: { display: false, tickLength: 0 },
                                border: { display: false },
                            },
                            y: {
                                max: 15.75,
                                min: 9.25,
                                ticks: { display: false },
                                grid: { display: false, tickLength: 0 },
                                border: { display: false },
                            },
                        },
                    },
                }),
            );
        });
    });

    it("should only determine min/max using number values", async () => {
        const pointData: ChartData<"line"> = {
            labels: Object.keys(values),
            datasets: [
                {
                    ...data.datasets[0],
                    data: [
                        { x: 1, y: 1 },
                        { x: 4, y: 4 },
                        { x: 2, y: 2 },
                    ],
                },
            ],
        };

        render(
            <Component
                data={pointData}
                hideGrid={true}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("LineChart")).toHaveTextContent(
                JSON.stringify({
                    data: {
                        ...fixture.data,
                        datasets: [
                            {
                                borderColor: "rgba(196, 200, 207, 1)",
                                data: [
                                    { x: 1, y: 1 },
                                    { x: 4, y: 4 },
                                    { x: 2, y: 2 },
                                ],
                                pointRadius: 0,
                                borderWidth: 2,
                                fill: false,
                                tension: 0.25,
                            },
                        ],
                    },
                    options: {
                        ...fixture.options,
                        plugins: { legend: { display: false }, tooltip: { enabled: false } },
                        scales: {
                            x: {
                                ...fixture.options.scales.x,
                                ticks: { display: false },
                                grid: { display: false, tickLength: 0 },
                                border: { display: false },
                            },
                            y: {
                                ticks: { display: false },
                                grid: { display: false, tickLength: 0 },
                                border: { display: false },
                            },
                        },
                    },
                }),
            );
        });
    });
});
