import {
    GRAPH_BACKGROUND_COLOR_EMPTY,
    GRAPH_BACKGROUND_COLOR_OTHER,
    GRAPH_BACKGROUND_COLORS,
    GRAPH_STROKE_COLOR_EMPTY,
    GRAPH_STROKE_COLOR_OTHER,
    GRAPH_STROKE_COLORS,
} from "@/Components/PortfolioBreakdown/PortfolioBreakdown.contracts";

export const getBackgroundColor = (index: number): string => {
    const colors = GRAPH_BACKGROUND_COLORS;

    return colors[index] ?? colors.at(-1);
};

export const getStrokeColor = (index: number): string => {
    const colors = GRAPH_STROKE_COLORS;

    return colors[index] ?? colors.at(-1);
};

export const getOtherGroupBackgroundColor = (): string => GRAPH_BACKGROUND_COLOR_OTHER;

export const getEmptyBackgroundColor = (): string => GRAPH_BACKGROUND_COLOR_EMPTY;

export const getOtherGroupStrokeColor = (): string => GRAPH_STROKE_COLOR_OTHER;

export const getEmptyStrokeColor = (): string => GRAPH_STROKE_COLOR_EMPTY;
