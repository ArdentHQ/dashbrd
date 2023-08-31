/* eslint-disable @typescript-eslint/unbound-method */
import { type SpyInstance } from "vitest";
import { replaceUrlQuery } from "./replace-url-query";

let replaceStateSpy: SpyInstance;

describe("replaceUrlQuery", () => {
    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        replaceStateSpy = vi.spyOn(window.history, "replaceState").mockImplementation(vi.fn() as any);
    });

    afterEach(() => {
        replaceStateSpy.mockRestore();
    });

    it("returns the updated URL with a single query parameter", () => {
        const newUrl = replaceUrlQuery({ foo: "bar" });
        expect(newUrl).toBe(`${window.location.origin}${window.location.pathname}?foo=bar`);
        expect(window.history.replaceState).toHaveBeenCalledWith(null, "", newUrl);
    });

    it("returns the updated URL with multiple query parameters", () => {
        const newUrl = replaceUrlQuery({ foo: "bar", baz: "qux" });
        expect(newUrl).toBe(`${window.location.origin}${window.location.pathname}?foo=bar&baz=qux`);
        expect(window.history.replaceState).toHaveBeenCalledWith(null, "", newUrl);
    });

    it("returns the updated URL with no query parameters if input is an empty object", () => {
        const newUrl = replaceUrlQuery({});
        expect(newUrl).toBe(`${window.location.origin}${window.location.pathname}`);
        expect(window.history.replaceState).toHaveBeenCalledWith(null, "", newUrl);
    });

    it("returns the updated URL with no query parameters if all input values are empty strings", () => {
        const newUrl = replaceUrlQuery({ foo: "", baz: "" });
        expect(newUrl).toBe(`${window.location.origin}${window.location.pathname}`);
        expect(window.history.replaceState).toHaveBeenCalledWith(null, "", newUrl);
    });
});
