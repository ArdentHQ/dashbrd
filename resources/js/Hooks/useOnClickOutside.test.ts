import useOnClickOutside from "./useOnClickOutside";
import { renderHook, userEvent } from "@/Tests/testing-library";

describe("useOnClickOutside", () => {
    it("should call the handler when clicking outside the element", async () => {
        const handler = vi.fn();

        const reference = {
            current: document.createElement("div"),
        };

        renderHook(() => {
            useOnClickOutside({ ref: reference, handler });
        });

        await userEvent.click(document.body);

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should not call the handler when clicking inside the element", async () => {
        const handler = vi.fn();

        const reference = {
            current: document.createElement("div"),
        };

        renderHook(() => {
            useOnClickOutside({ ref: reference, handler });
        });

        await userEvent.click(reference.current);

        expect(handler).toHaveBeenCalledTimes(0);
    });

    it("should not call the handler when the hook is disabled", async () => {
        const handler = vi.fn();

        const reference = {
            current: document.createElement("div"),
        };

        renderHook(() => {
            useOnClickOutside({ ref: reference, handler, enabled: false });
        });

        await userEvent.click(document.body);

        expect(handler).toHaveBeenCalledTimes(0);
    });

    it("should not call the handler when the reference is null", async () => {
        const handler = vi.fn();

        const reference = {
            current: null,
        };

        renderHook(() => {
            useOnClickOutside({ ref: reference, handler, enabled: false });
        });

        await userEvent.click(document.body);

        expect(handler).toHaveBeenCalledTimes(0);
    });
});
