import { formatPercentage } from "./format-percentage";

describe("formatPercentage", () => {
    it("should format correctly", () => {
        expect(formatPercentage(10)).toEqual("10%");
        expect(formatPercentage(20)).toEqual("20%");
        expect(formatPercentage(35.4)).toEqual("35.4%");
        expect(formatPercentage(42.234)).toEqual("42.2%");
        expect(formatPercentage(0)).toEqual("0%");
    });
});
