import { isEqual } from "@ardenthq/sdk-helpers";
import { Chart, type ChartData, type ChartDataset, type Point, registerables } from "chart.js";
import cn from "classnames";
import { memo, useEffect, useRef } from "react";
import { usePriceChart } from "./Hooks/usePriceChart";
import { LineChart } from "@/Components/Graphs";

interface Properties {
    values: number[];
    labels: string[];
    isPlaceholder?: boolean;
    className?: string;
    initialDataset?: Array<ChartDataset<"line", Array<number | Point | null>>>;
}

export const PriceChart = memo(
    ({
        isPlaceholder = false,
        values,
        labels,
        className = "w-25 h-10",
        initialDataset,
        ...properties
    }: Properties): JSX.Element => {
        Chart.register(...registerables);

        const chartReference = useRef<Chart<"line">>();

        const datasets: Array<ChartDataset<"line", Array<number | Point | null>>> = initialDataset ?? [
            {
                borderColor: "rgba(196, 200, 207, 1)",
                data: values,
                pointRadius: 0,
                borderWidth: 2,
                fill: false,
                tension: 0.25,
            },
        ];

        const data: ChartData<"line"> = {
            labels,
            datasets,
        };

        const { updateChartData } = usePriceChart();

        useEffect(() => {
            updateChartData({
                chart: chartReference.current,
                labels,
                isPlaceholder,
                datasets,
                values,
            });
        }, [data, values, isPlaceholder]);

        return (
            <div
                data-testid="PriceChart__container"
                className={cn(className)}
            >
                <LineChart
                    reference={chartReference}
                    data={data}
                    hideGrid={true}
                    {...properties}
                />
            </div>
        );
    },
    /* istanbul ignore next -- @preserve */
    (previous, next) => isEqual(previous.values, next.values) && isEqual(previous.isPlaceholder, next.isPlaceholder),
);

PriceChart.displayName = "PriceChart";
