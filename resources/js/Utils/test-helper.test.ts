import { isUnit } from "./test-helpers";

describe("testHelper", () => {
    it("should return true when process.env is set to true or 1", () => {
        process.env.REACT_APP_IS_UNIT = "true";
        expect(isUnit()).toBe(true);

        process.env.REACT_APP_IS_UNIT = "1";
        expect(isUnit()).toBe(true);
    });

    it("should return false when process.env is set to false", () => {
        process.env.REACT_APP_IS_UNIT = "false";
        expect(isUnit()).toBe(false);
    });

    it("should return false when process.env is set to empty string", () => {
        process.env.REACT_APP_IS_UNIT = "";
        expect(isUnit()).toBe(false);
    });

    it("should return false for any non-true value", () => {
        process.env.REACT_APP_IS_UNIT = undefined;
        expect(isUnit()).toBe(false);

        process.env.REACT_APP_IS_UNIT = "not true";
        expect(isUnit()).toBe(false);

        process.env.REACT_APP_IS_UNIT = "asdfasdf";
        expect(isUnit()).toBe(false);

        process.env.REACT_APP_IS_UNIT = "test";
        expect(isUnit()).toBe(false);
    });
});
