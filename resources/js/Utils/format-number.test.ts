import { formatNumbershort } from "./format-number";

describe("formatNumbershort", () => {
    it("should format numbers correctly", () => {
        // Test for numbers less than 1000
        expect(formatNumbershort(500)).toEqual("500");
        expect(formatNumbershort(999)).toEqual("999");

        // Test for number equal to 1000
        expect(formatNumbershort(1000)).toEqual("1k");

        // Test for numbers greater than 1000 but less than 1 million
        expect(formatNumbershort(1235)).toEqual("1.2k");
        expect(formatNumbershort(999999)).toEqual("1000.0k");

        // Test for numbers equal to or greater than 1 million
        expect(formatNumbershort(1000000)).toEqual("1.0m");
        expect(formatNumbershort(1500000)).toEqual("1.5m");
    });
});
