import { last } from "@ardenthq/sdk-helpers";
import { type Chart, type ChartDataset, type Point } from "chart.js";
import { determineMinMaxDataValues } from "@/Components/Graphs/LineChart";
import { isTruthy } from "@/Utils/is-truthy";

interface UpdatePriceDataProperties {
    chart?: Chart<"line">;
    labels: string[];
    values: number[];
    isPlaceholder?: boolean;
    datasets: Array<ChartDataset<"line", Array<number | Point | null>>>;
}

const updateChartData = ({ chart, labels, values, isPlaceholder, datasets }: UpdatePriceDataProperties): void => {
    if (chart === undefined) {
        return;
    }

    const { max: maxValue, min: minValue } = determineMinMaxDataValues(values);

    const isPositive: boolean = values[0] < last(values);

    if (isTruthy(isPlaceholder)) {
        chart.data.datasets[0].borderColor = "rgba(196, 200, 207, 1)";
    } else if (isPositive) {
        chart.data.datasets[0].borderColor = "rgba(40, 149, 72, 1)";
    } else {
        chart.data.datasets[0].borderColor = "rgba(222, 88, 70, 1)";
    }

    for (const [index, label] of Object.entries(labels)) {
        chart.data.labels?.splice(Number(index), 1, label);
    }

    for (const [index, value] of Object.entries(datasets[0].data)) {
        chart.data.datasets[0].data.splice(Number(index), 1, value);
    }

    if (chart.options.scales?.y !== undefined) {
        chart.options.scales.y.max = maxValue;
        chart.options.scales.y.min = minValue;
    }

    chart.update();
};

export const usePriceChart = (): {
    updateChartData: (properties: UpdatePriceDataProperties) => void;
} => ({
    updateChartData,
});
