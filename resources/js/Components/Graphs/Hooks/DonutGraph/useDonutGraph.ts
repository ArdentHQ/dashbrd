import type React from "react";
import { useMemo } from "react";

import {
    BACKGROUND_CIRCLE_SPACING,
    type DonutGraphCircle,
    type DonutGraphConfig,
    GRAPH_MARGIN,
    RADIUS_HOVER_INCREMENT,
    SEGMENT_SPACING,
} from "@/Components/Graphs/DonutGraph/DonutGraph.contracts";

import { type GraphDataPoint } from "@/Components/Graphs/Graphs.contracts";
import { GRAPH_STROKE_COLOR_EMPTY } from "@/Components/PortfolioBreakdown/PortfolioBreakdown.contracts";
import { getStrokeColor } from "@/Components/PortfolioBreakdown/PortfolioBreakdown.helpers";

interface UseDonutGraphHook {
    backgroundCircle: React.SVGProps<SVGCircleElement>;
    circles: DonutGraphCircle[];
}

const getData = (config: DonutGraphConfig, data: Array<GraphDataPoint | null>): DonutGraphCircle[] => {
    const { circleCommonProperties, circumference, circumferenceHover, radius, radiusHover } = config;

    return useMemo<DonutGraphCircle[]>(() => {
        const items: DonutGraphCircle[] = [];

        // When there is only 1 segment avoid showing
        // the space between start and end of it.
        const spacing = data.length > 1 ? SEGMENT_SPACING : 0;

        // By default circle dasharray starts at 90°, which would be 25 given a
        // circumference of 100. Set initial offset to 25 (in proportion to the
        // circumference) to make sure that the first slice will start at 12:00.
        let strokeDashoffset = circumference * 0.25;
        let strokeDashoffsetHover = circumferenceHover * 0.25;

        for (const entry of data) {
            let value: number = entry === null ? 0 : entry.value;
            let color = GRAPH_STROKE_COLOR_EMPTY;
            if (data.length > 0 && value > 0 && entry !== null) {
                color = getStrokeColor(entry.data.index);
            } else if (data.length === 1 && value === 0) {
                value = 100;
            }

            const spacingPercentage = (spacing * data.length) / circumference / data.length;
            const spacingHoverPercentage = (spacing * data.length) / circumferenceHover / data.length;

            const dashSizeWithSpacing = (value / 100 - spacingPercentage) * 100;
            const dashHoverSizeWithSpacing = (value / 100 - spacingHoverPercentage) * 100;

            const dashStart = (circumference * dashSizeWithSpacing) / 100;
            const dashEnd = (circumference * (100 - dashSizeWithSpacing)) / 100;

            const dashHoverStart = (circumferenceHover * dashHoverSizeWithSpacing) / 100;
            const dashHoverEnd = (circumferenceHover * (100 - dashHoverSizeWithSpacing)) / 100;

            if (items.length === 0) {
                strokeDashoffset -= spacing / 2;
                strokeDashoffsetHover -= spacing / 2;
            }

            const strokeDasharray = [dashStart, dashEnd].join(" ");
            const strokeDasharrayHover = [dashHoverStart, dashHoverEnd].join(" ");

            items.push({
                animations: [
                    { attribute: "r", from: radius, to: radiusHover },
                    { attribute: "stroke-dasharray", from: strokeDasharray, to: strokeDasharrayHover },
                    { attribute: "stroke-dashoffset", from: strokeDashoffset, to: strokeDashoffsetHover },
                    { attribute: "stroke-width", from: 8, to: 12 },
                ],
                circleProperties: {
                    ...circleCommonProperties,
                    className: color,
                    strokeDasharray,
                    strokeDashoffset,
                },
            });

            // stroke-dashoffset has to be equal to the sum of the
            // lengths of the previous segments or they will overlap.
            strokeDashoffset += dashEnd - spacing;
            strokeDashoffsetHover += dashHoverEnd - spacing;
        }

        return items;
    }, [circumference, circumferenceHover, data]);
};

const useDonutGraph = (data: GraphDataPoint[], size: number): UseDonutGraphHook => {
    const config = useMemo<DonutGraphConfig>(() => {
        const diameter = size - GRAPH_MARGIN * 2;
        const center = size / 2;

        const radius = diameter / 2;
        const radiusHover = radius + RADIUS_HOVER_INCREMENT;

        return {
            circleCommonProperties: {
                cx: center,
                cy: center,
                fill: "transparent",
                r: radius,
                strokeLinecap: "round",
                strokeWidth: 8,
            },
            circumference: diameter * Math.PI,
            circumferenceHover: radiusHover * 2 * Math.PI,
            radius,
            radiusHover,
        };
    }, [size]);

    const { circleCommonProperties, radius } = config;

    const backgroundCircle = useMemo<React.SVGProps<SVGCircleElement>>(
        () => ({
            ...circleCommonProperties,
            className: "fill-current text-theme-secondary-200",
            fill: "inherit",
            r: radius - BACKGROUND_CIRCLE_SPACING,
            strokeWidth: 0,
        }),
        [size],
    );

    let circles = [];
    if (data.length > 0) {
        circles = getData(config, data);
    } else {
        circles = getData(config, [null]);
    }

    return {
        backgroundCircle,
        circles,
    };
};

export { useDonutGraph };
