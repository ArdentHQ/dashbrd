type GraphType = "donut";

interface GraphDataPointMeta {
    value: number;
    index: number;
    label: string;
}

interface GraphDataPoint {
    formatted: string;
    value: number;
    data: GraphDataPointMeta;
}

// Values calculated as [size * minimum visible value].
// The bigger the value, the higher the chance for
// smallest data points to end up in the "other" group.
const GRAPH_MIN_VALUE: Record<GraphType, number> = {
    donut: 1120,
};

type AddToOtherGroupFunction = (otherGroup: GraphDataPoint | undefined, entry: GraphDataPoint) => GraphDataPoint;

export type { AddToOtherGroupFunction, GraphDataPoint, GraphType, GraphDataPointMeta };

export { GRAPH_MIN_VALUE };
