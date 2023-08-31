import { type ChartData, type TimeUnit } from "chart.js";
import { type ForwardedRef } from "react";
import { type ChartJSOrUndefined } from "react-chartjs-2/dist/types";

export interface LineChartProperties {
    className?: string;
    hideGrid?: boolean;
    data: ChartData<"line">;
    reference?: ForwardedRef<ChartJSOrUndefined<"line">>;
    unit?: false | TimeUnit;
}

type DataValue = number | undefined;

export const determineMinMaxDataValues = (values: number[]): { max: DataValue; min: DataValue } => {
    let max: DataValue;
    let min: DataValue;
    if (values.length > 0) {
        // The margin is used to not cut the line at the top/bottom
        const margin = Math.max(...values) * 0.05;
        max = Math.max(...values) + margin;
        min = Math.min(...values) - margin;
    }

    return {
        max,
        min,
    };
};
