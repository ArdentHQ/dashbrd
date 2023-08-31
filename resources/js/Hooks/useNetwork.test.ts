import { useNetwork } from "./useNetwork";
import { renderHook } from "@/Tests/testing-library";

describe("useNetwork", () => {
    it("should return true for polygon chain id", () => {
        const { result } = renderHook(() => useNetwork());

        expect(result.current.isPolygon(137)).toBe(true);
        expect(result.current.isPolygon(80001)).toBe(true);
        expect(result.current.isPolygon(1)).toBe(false);
    });

    it("should return true for ethereum chain id", () => {
        const { result } = renderHook(() => useNetwork());

        expect(result.current.isEthereum(1)).toBe(true);
        expect(result.current.isEthereum(5)).toBe(true);
        expect(result.current.isEthereum(137)).toBe(false);
    });
});
