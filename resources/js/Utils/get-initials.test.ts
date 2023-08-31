import { getInitials } from "./get-initials";

describe("getInitials", () => {
    it("returns the first two letters from the words in the text", () => {
        expect(getInitials("Polygon Network Example")).toBe("PN");
    });

    it("returns the first N letters from the words in the text", () => {
        expect(getInitials("Polygon Network EXAMPLE", 3)).toBe("PNE");
    });

    it("returns the first two letters from a single word", () => {
        expect(getInitials("Polygon")).toBe("PO");
    });

    it("returns the first N letters from a single word", () => {
        expect(getInitials("Polygon", 4)).toBe("POLY");
    });
});
