import React from "react";
import { PriceChart } from "./PriceChart";
import { render, screen, waitFor } from "@/Tests/testing-library";

describe("PriceChart", () => {
    const values = [10, 15, 11];

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
            animations: { tension: { duration: 500, easing: "linear" } },
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: {
                    time: { unit: "hour" },
                    adapters: {
                        date: {
                            locale: {
                                code: "en-US",
                                formatLong: {},
                                localize: {},
                                match: {},
                                options: { weekStartsOn: 0, firstWeekContainsDate: 1 },
                            },
                        },
                    },
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
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should render", () => {
        render(
            <PriceChart
                labels={Object.keys(values)}
                values={values}
                initialDataset={[
                    {
                        borderColor: "rgba(196, 200, 207, 1)",
                        data: values,
                        pointRadius: 0,
                        borderWidth: 2,
                        fill: false,
                        tension: 0.25,
                    },
                ]}
            />,
        );

        expect(screen.getByTestId("LineChart")).toHaveTextContent(JSON.stringify(fixture.data));
    });

    it("should render as placeholder", async () => {
        render(
            <PriceChart
                isPlaceholder={true}
                labels={Object.keys(values)}
                values={values}
            />,
        );

        await waitFor(() => {
            expect(screen.getByTestId("LineChart")).toHaveTextContent(JSON.stringify(fixture));
        });
    });

    it("should render a negative chart", () => {
        const negativeValues = [50, 25, 10];

        render(
            <PriceChart
                labels={Object.keys(negativeValues)}
                values={negativeValues}
            />,
        );

        expect(screen.getByTestId("LineChart")).toHaveTextContent(
            JSON.stringify({
                data: {
                    labels: ["0", "1", "2"],
                    datasets: [
                        {
                            borderColor: "rgba(196, 200, 207, 1)",
                            data: negativeValues,
                            pointRadius: 0,
                            borderWidth: 2,
                            fill: false,
                            tension: 0.25,
                        },
                    ],
                },
                options: {
                    ...fixture.options,
                    scales: {
                        ...fixture.options.scales,
                        y: {
                            ...fixture.options.scales.y,
                            max: 52.5,
                            min: 7.5,
                        },
                    },
                },
            }),
        );
    });
});
