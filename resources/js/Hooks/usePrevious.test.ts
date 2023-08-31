import { renderHook } from "@testing-library/react";

import { usePrevious } from "./usePrevious";

describe("usePrevious", () => {
    it("Should render", () => {
        const { result } = renderHook(() => usePrevious({ result: { current: true } }));

        expect(result).toBeTruthy();
    });
});
