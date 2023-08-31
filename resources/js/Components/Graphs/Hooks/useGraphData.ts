import { useCallback } from "react";
import { offsetPercentages } from "./useGraphData.contracts";
import {
    type AddToOtherGroupFunction,
    GRAPH_MIN_VALUE,
    type GraphDataPoint,
    type GraphType,
} from "@/Components/Graphs/Graphs.contracts";

type UseGraphDataHook = (
    graphType: GraphType,
    addToOtherGroup: AddToOtherGroupFunction,
) => {
    group: (data: GraphDataPoint[], size: number) => GraphDataPoint[];
};

export const useGraphData: UseGraphDataHook = (graphType, addToOtherGroup) => {
    const isTooSmallToBeVisible = useCallback(
        (value: number, size: number) => value * size < GRAPH_MIN_VALUE[graphType],
        [graphType],
    );

    const group = useCallback(
        (data: GraphDataPoint[], size: number) => {
            const result: GraphDataPoint[] = [];

            let otherGroup: GraphDataPoint | undefined;

            let itemCount = 0;

            for (const entry of data) {
                itemCount++;

                if (isTooSmallToBeVisible(entry.value, size) || itemCount > 5) {
                    otherGroup = addToOtherGroup(otherGroup, entry);
                    continue;
                }

                result.push(entry);
            }

            if (otherGroup !== undefined && !isTooSmallToBeVisible(otherGroup.value, size)) {
                result.push(otherGroup);
            }

            return offsetPercentages(result);
        },
        [addToOtherGroup, isTooSmallToBeVisible],
    );

    return { group };
};
