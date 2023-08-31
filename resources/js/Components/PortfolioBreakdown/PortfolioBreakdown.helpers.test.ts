import {
    getBackgroundColor,
    getEmptyBackgroundColor,
    getEmptyStrokeColor,
    getOtherGroupBackgroundColor,
    getOtherGroupStrokeColor,
    getStrokeColor,
} from "./PortfolioBreakdown.helpers";
import {
    GRAPH_BACKGROUND_COLOR_EMPTY,
    GRAPH_BACKGROUND_COLOR_OTHER,
    GRAPH_BACKGROUND_COLORS,
    GRAPH_STROKE_COLOR_EMPTY,
    GRAPH_STROKE_COLOR_OTHER,
    GRAPH_STROKE_COLORS,
} from "@/Components/PortfolioBreakdown/PortfolioBreakdown.contracts";

describe("PortfolioBreakdownHelpers", () => {
    it("should return background color by index", () => {
        for (let index = 0; index < GRAPH_BACKGROUND_COLORS.length; index++) {
            expect(getBackgroundColor(index)).toBe(GRAPH_BACKGROUND_COLORS[index]);
        }
    });

    it("should return last background color when index out of range", () => {
        const last = GRAPH_BACKGROUND_COLORS.at(-1);
        expect(getBackgroundColor(GRAPH_BACKGROUND_COLORS.length)).toBe(last);
        expect(getBackgroundColor(999)).toBe(last);
        expect(getBackgroundColor(-25)).toBe(last);
    });

    it("should return other background color", () => {
        expect(getOtherGroupBackgroundColor()).toBe(GRAPH_BACKGROUND_COLOR_OTHER);
    });

    it("should return empty background color", () => {
        expect(getEmptyBackgroundColor()).toBe(GRAPH_BACKGROUND_COLOR_EMPTY);
    });

    it("should return stroke color by index", () => {
        for (let index = 0; index < GRAPH_STROKE_COLORS.length; index++) {
            expect(getStrokeColor(index)).toBe(GRAPH_STROKE_COLORS[index]);
        }
    });

    it("should return last stroke color when index out of range", () => {
        const last = GRAPH_STROKE_COLORS.at(-1);
        expect(getStrokeColor(GRAPH_STROKE_COLORS.length)).toBe(last);
        expect(getStrokeColor(999)).toBe(last);
        expect(getStrokeColor(-25)).toBe(last);
    });

    it("should return other stroke color", () => {
        expect(getOtherGroupStrokeColor()).toBe(GRAPH_STROKE_COLOR_OTHER);
    });

    it("should return empty stroke color", () => {
        expect(getEmptyStrokeColor()).toBe(GRAPH_STROKE_COLOR_EMPTY);
    });
});
