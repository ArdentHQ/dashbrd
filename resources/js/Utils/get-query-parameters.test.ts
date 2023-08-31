import { getQueryParameters } from "./get-query-parameters";

describe("getQueryParameters", () => {
    beforeEach(() => {
        Object.defineProperty(window, "location", {
            value: {
                search: "?foo=bar&baz=qux",
            },
            writable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return the query parameters as an object", () => {
        const result = getQueryParameters();
        expect(result).toEqual({ foo: "bar", baz: "qux" });
    });

    it("should omit empty query parameters", () => {
        Object.defineProperty(window, "location", {
            value: {
                search: "?foo=&baz=qux",
            },
            writable: true,
        });

        const result = getQueryParameters();
        expect(result).toEqual({ baz: "qux" });
    });

    it("should handle URL with no query parameters", () => {
        Object.defineProperty(window, "location", {
            value: {
                search: "http://example.com/",
            },
            writable: true,
        });

        const result = getQueryParameters();
        expect(result).toEqual({});
    });

    it("should handle URL with multiple query parameters", () => {
        Object.defineProperty(window, "location", {
            value: {
                search: "?foo=bar&baz=qux&abc=xyz",
            },
            writable: true,
        });

        const result = getQueryParameters();
        expect(result).toEqual({ foo: "bar", baz: "qux", abc: "xyz" });
    });
});
