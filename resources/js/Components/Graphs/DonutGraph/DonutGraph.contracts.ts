import type React from "react";
import { type GraphAnimation } from "@/Components/Graphs/GraphHoverAnimation";

const BACKGROUND_CIRCLE_SPACING = 16;
const GRAPH_MARGIN = 32;
const RADIUS_HOVER_INCREMENT = 16;
const SEGMENT_SPACING = 16;

interface DonutGraphConfig {
    circleCommonProperties: React.SVGProps<SVGCircleElement>;
    circumference: number;
    circumferenceHover: number;
    radius: number;
    radiusHover: number;
}

interface DonutGraphCircle {
    circleProperties: React.SVGProps<SVGCircleElement>;
    animations: GraphAnimation[];
}

export { BACKGROUND_CIRCLE_SPACING, GRAPH_MARGIN, RADIUS_HOVER_INCREMENT, SEGMENT_SPACING };

export type { DonutGraphCircle, DonutGraphConfig };
