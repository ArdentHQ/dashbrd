import { Chart, type ChartOptions, registerables } from "chart.js";
import { enUS } from "date-fns/locale";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { determineMinMaxDataValues, type LineChartProperties } from "@/Components/Graphs/LineChart";

export const LineChart = ({
    data,
    reference,
    unit = "hour",
    hideGrid = false,
    className = "",
    ...properties
}: LineChartProperties): JSX.Element => {
    Chart.register(...registerables);

    const values: number[] = [];
    for (const value of data.datasets[0].data) {
        if (typeof value !== "number") {
            continue;
        }

        values.push(value);
    }

    const { max: maxValue, min: minValue } = determineMinMaxDataValues(values);

    const options: ChartOptions<"line"> = {
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
                display: !hideGrid,
            },
            tooltip: {
                enabled: !hideGrid,
            },
        },
        scales: {
            x: {
                time: {
                    unit,
                },
                adapters: {
                    date: {
                        locale: enUS,
                    },
                },
                ticks: {
                    display: !hideGrid,
                },
                grid: {
                    display: !hideGrid,
                    tickLength: 0,
                },
                border: {
                    display: !hideGrid,
                },
            },
            y: {
                max: maxValue,
                min: minValue,
                ticks: {
                    display: !hideGrid,
                },
                grid: {
                    display: !hideGrid,
                    tickLength: 0,
                },
                border: {
                    display: !hideGrid,
                },
            },
        },
    };

    return (
        <Line
            data-testid="LineChart"
            ref={reference}
            options={options}
            data={data}
            className={className}
            {...properties}
        />
    );
};
