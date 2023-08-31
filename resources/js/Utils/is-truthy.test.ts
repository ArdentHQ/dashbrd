import { isTruthy } from "./is-truthy";

describe("isTruty", () => {
    it("should return false for undefined value", () => {
        expect(isTruthy(undefined)).toBe(false);
    });

    it("should return false for null value", () => {
        expect(isTruthy(null)).toBe(false);
    });

    it("should return false for zero number", () => {
        expect(isTruthy(0)).toBe(false);
    });

    it("should return true for numbers greater than zero", () => {
        expect(isTruthy(1)).toBe(true);
    });

    it("should return true for string", () => {
        expect(isTruthy("test")).toBe(true);
    });

    it("should handle boolean", () => {
        expect(isTruthy(true)).toBe(true);
    });

    it("should return true if value is a function", () => {
        expect(isTruthy(vi.fn())).toBe(true);
    });

    it("should return true if value is an object", () => {
        expect(isTruthy({})).toBe(true);
    });

    it("should return true if value is an array", () => {
        expect(isTruthy([])).toBe(true);
    });
});
