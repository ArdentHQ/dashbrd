import { formatPriceChange, getPriceChangeType } from "./PriceChange.utils";

describe("getPriceChangeType", () => {
    it("should get price change type correctly", () => {
        expect(getPriceChangeType(1)).toBe("positive");
        expect(getPriceChangeType(-1)).toBe("negative");
        expect(getPriceChangeType(0)).toBe("neutral");
        expect(getPriceChangeType(10.01)).toBe("positive");
        expect(getPriceChangeType(0.001)).toBe("positive");
        expect(getPriceChangeType(-0.001)).toBe("negative");
        expect(getPriceChangeType(-0.0011)).toBe("negative");
        expect(getPriceChangeType(-10)).toBe("negative");

        // rounded away because more than 3 decimals
        expect(getPriceChangeType(-0.0001)).toBe("neutral");
        expect(getPriceChangeType(0.0001)).toBe("neutral");
    });

    it("should format price change correctly", () => {
        expect(formatPriceChange(1)).toBe("+1.00%");
        expect(formatPriceChange(-1)).toBe("-1.00%");
        expect(formatPriceChange(1.24)).toBe("+1.24%");
        expect(formatPriceChange(1.2444)).toBe("+1.24%");
        expect(formatPriceChange(0.0)).toBe("0.00%");
        expect(formatPriceChange(0.001)).toBe("+0.00%");
        expect(formatPriceChange(-0.001)).toBe("-0.00%");
        expect(formatPriceChange(-240.31)).toBe("-240.31%");
        expect(formatPriceChange(999.1292)).toBe("+999.13%");
    });
});
