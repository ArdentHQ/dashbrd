import { renderHook, waitFor } from "@testing-library/react";
import { type Instance } from "tippy.js";

import { useTooltip } from "./use-tooltip";

describe("useTooltip", () => {
    const unkownInstance: { hide: () => void } = { hide: vi.fn() };
    const instance = unkownInstance as Instance & { hide: () => void };

    it("should not hide element if hideAfter is not provided", async () => {
        const { result } = renderHook(() => useTooltip());

        result.current.handleShow(instance);

        await waitFor(() => {
            expect(instance.hide).not.toHaveBeenCalled();
        });
    });

    it("should hide element if hideAfter is provided", async () => {
        const { result } = renderHook(() => useTooltip({ hideAfter: 100 }));

        result.current.handleShow(instance);

        await waitFor(() => {
            expect(instance.hide).toHaveBeenCalled();
        });
    });
});
