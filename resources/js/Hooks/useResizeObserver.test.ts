import { useRef } from "react";
import { expect, type SpyInstance } from "vitest";
import { useResizeObserver } from "@/Hooks/useResizeObserver";
import { renderHook } from "@/Tests/testing-library";

describe("useResizeObserver", () => {
    let resizeObserverMock: SpyInstance;

    beforeEach(() => {
        resizeObserverMock = vi.spyOn(window, "ResizeObserver");

        resizeObserverMock.mockImplementation(
            (callback: (properties: [{ contentRect: { width: number } }]) => void) => ({
                observe: () => {
                    // eslint-disable-next-line n/no-callback-literal
                    callback([{ contentRect: { width: 50 } }]);
                },
                disconnect: vi.fn(),
            }),
        );
    });

    afterEach(() => {
        resizeObserverMock.mockRestore();
    });

    it("should call the callback when the element resizes", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        const {
            result: { current: reference },
        } = renderHook(() => useRef(div));

        const callback = vi.fn();

        renderHook(() => {
            useResizeObserver(reference, callback);
        });

        expect(callback).toHaveBeenCalled();

        document.body.removeChild(div);
    });
});
