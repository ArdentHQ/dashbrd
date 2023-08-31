import { act, renderHook } from "@testing-library/react-hooks";

import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
    it("should render useDebounce", () => {
        vi.useFakeTimers();

        const { result } = renderHook(() => useDebounce("query", 2000));

        // loading
        expect(result.current[1]).toBeTruthy();

        act(() => {
            vi.runAllTimers();
        });

        expect(result.current[1]).toBeFalsy();
    });
});
