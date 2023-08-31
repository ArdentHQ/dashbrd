export const GRAPH_BACKGROUND_COLOR_EMPTY = "bg-theme-secondary-300";
export const GRAPH_BACKGROUND_COLOR_OTHER = "bg-theme-secondary-400";
export const GRAPH_STROKE_COLOR_EMPTY = "stroke-theme-secondary-300";
export const GRAPH_STROKE_COLOR_OTHER = "stroke-theme-secondary-400";

export const GRAPH_STROKE_COLORS = [
    "stroke-theme-hint-600",
    "stroke-theme-hint-400",
    "stroke-theme-warning-400",
    "stroke-theme-success-400",
    "stroke-theme-danger-400",
    GRAPH_STROKE_COLOR_OTHER,
] as const;

export const GRAPH_BACKGROUND_COLORS = [
    "bg-theme-hint-600",
    "bg-theme-hint-400",
    "bg-theme-warning-400",
    "bg-theme-success-400",
    "bg-theme-danger-400",
    GRAPH_BACKGROUND_COLOR_OTHER,
] as const;
