import { type GraphDataPoint } from "@/Components/Graphs/Graphs.contracts";

export const offsetPercentages = (data: Array<GraphDataPoint | null>): GraphDataPoint[] => {
    const percentageTotal = data.reduce(
        (partialSum: number, asset: GraphDataPoint | null): number => partialSum + (asset?.value ?? 0),
        0,
    );

    let filteredData = data.filter((dataPoint) => dataPoint != null) as GraphDataPoint[];

    if (percentageTotal !== 100) {
        filteredData = filteredData.map((dataPoint) => {
            const percentage = (dataPoint.value / percentageTotal) * 100;

            return {
                ...dataPoint,
                value: percentage,
            };
        });
    }

    return filteredData;
};
