import { useNetworks } from "./useNetworks";
import { renderHook } from "@/Tests/testing-library";

describe("useNetworks", () => {
    it("should get explorer url for supported chain", () => {
        const { result } = renderHook(() => useNetworks());

        expect(result.current.getExplorerUrlsKeyByChainId(1)).toBe("etherscan");
        expect(result.current.getExplorerUrlsKeyByChainId(137)).toBe("polygonscan");
        expect(result.current.getExplorerUrlsKeyByChainId(5)).toBe("goerli");
        expect(result.current.getExplorerUrlsKeyByChainId(80001)).toBe("mumbai");
    });

    it("should throw if chain is not supported", () => {
        const { result } = renderHook(() => useNetworks());

        expect(() => result.current.getExplorerUrlsKeyByChainId(143)).toThrowError(
            "getExplorerUrlsKeyByChainId] Chain [143]is not supported",
        );
    });
});
