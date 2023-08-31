import { useRef } from "react";
import { type SpyInstance } from "vitest";
import { useIsTruncated } from "./useIsTruncated";
import { renderHook } from "@/Tests/testing-library";

describe("useIsTruncated", () => {
    let resizeObserverMock: SpyInstance;

    beforeEach(() => {
        resizeObserverMock = vi.spyOn(window, "ResizeObserver");

        const function_ = vi.fn();

        resizeObserverMock.mockImplementation(
            (callback: (properties: [{ contentRect: { width: number } }]) => void) => ({
                observe: () => {
                    // eslint-disable-next-line n/no-callback-literal
                    callback([{ contentRect: { width: 50 } }]);
                },
                disconnect: function_,
            }),
        );
    });

    afterEach(() => {
        resizeObserverMock.mockRestore();
    });

    it("should return false if the element is not provided", () => {
        const {
            result: { current: reference },
        } = renderHook(() => useRef(null));

        const { result } = renderHook(() => useIsTruncated({ reference }));

        expect(result.current).toBe(false);
    });

    it("should return false if the element is not truncated", () => {
        const div = document.createElement("div");
        vi.spyOn(div, "scrollWidth", "get").mockReturnValue(50);
        document.body.appendChild(div);

        const {
            result: { current: reference },
        } = renderHook(() => useRef(div));

        const { result } = renderHook(() => useIsTruncated({ reference }));

        expect(result.current).toBe(false);

        document.body.removeChild(div);
    });

    it("should return true if the element is truncated", () => {
        const div = document.createElement("div");
        vi.spyOn(div, "scrollWidth", "get").mockReturnValue(100);
        document.body.appendChild(div);

        const {
            result: { current: reference },
        } = renderHook(() => useRef(div));

        const { result } = renderHook(() => useIsTruncated({ reference }));

        expect(result.current).toBe(true);

        document.body.removeChild(div);
    });
});
