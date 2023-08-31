import axios from "axios";
import { type SpyInstance } from "vitest";
import { useLiveSearch } from "./useLiveSearch";
import { act, renderHook, waitFor } from "@/Tests/testing-library";

let axiosSpy: SpyInstance;

const TEST_QUERY = "test query";

describe("useLiveSearch", () => {
    const request = vi.fn();
    const onResult = vi.fn();
    const onError = vi.fn();
    const defaultValue: unknown[] = [];

    beforeEach(() => {
        request.mockClear();
        onResult.mockClear();
        onError.mockClear();

        axiosSpy = vi.spyOn(axios, "isCancel").mockReturnValue(false);
    });

    afterEach(() => {
        axiosSpy.mockRestore();
    });

    it("initializes with empty query and loading false", () => {
        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));

        expect(result.current.query).toBe("");
        expect(result.current.loading).toBe(false);
    });

    it("sets query when setQuery is called", () => {
        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        expect(result.current.query).toBe(TEST_QUERY);
    });

    it("calls request function with throttled query", async () => {
        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        expect(request).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(request).toHaveBeenCalledWith(TEST_QUERY);
        });
    });

    it("calls onResult when request succeeds", async () => {
        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));
        request.mockResolvedValue("result");

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        await waitFor(() => {
            expect(onResult).toHaveBeenCalledWith("result");
        });
    });

    it("calls onResult with default value if no query", async () => {
        const defaultValue = ["default value"];
        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));

        request.mockResolvedValue("result");

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        await waitFor(() => {
            expect(onResult).toHaveBeenCalledWith("result");
        });

        // Now Call setQuery with empty string
        act(() => {
            result.current.setQuery("");
        });

        await waitFor(() => {
            expect(onResult).toHaveBeenCalledWith(defaultValue);
        });

        expect(request).toBeCalledTimes(1);
    });

    it("calls onError when request fails with non-cancel error", async () => {
        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));
        request.mockRejectedValue(new Error("test error"));

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(new Error("test error"));
        });
    });

    it("does not call onResult or onError when request fails with cancel error", async () => {
        axiosSpy.mockRestore();
        axiosSpy = vi.spyOn(axios, "isCancel").mockReturnValue(true);

        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));
        request.mockRejectedValue(new Error("test error"));

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        await waitFor(() => {
            expect(axiosSpy).toHaveBeenCalledWith(new Error("test error"));
        });

        expect(onError).not.toHaveBeenCalled();
        expect(onResult).not.toHaveBeenCalled();
    });

    it("sets loading to false after search is done", async () => {
        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));
        request.mockResolvedValue("result");

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });
    });

    it("does not trigger new search if throttledQuery is the same as searchedQuery", async () => {
        const { result } = renderHook(() => useLiveSearch({ request, onResult, onError, defaultValue }));
        request.mockResolvedValue("result");

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        act(() => {
            result.current.setQuery(TEST_QUERY);
        });

        await waitFor(() => {
            expect(request).toHaveBeenCalledTimes(1);
        });
    });
});
