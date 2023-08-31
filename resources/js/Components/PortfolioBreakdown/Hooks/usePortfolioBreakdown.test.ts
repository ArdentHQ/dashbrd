import { usePortfolioBreakdown } from "./usePortfolioBreakdown";
import TokenPortfolioDataFactory from "@/Tests/Factories/TokenPortfolioDataFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { act, renderHook, waitFor } from "@/Tests/testing-library";

describe("usePortfolioBreakdown", () => {
    it("should return an empty set of assets and loading state initially", () => {
        server.use(requestMockOnce(`${BASE_URL}/tokens/breakdown`, new TokenPortfolioDataFactory().createMany(3)));
        const { result } = renderHook(() => usePortfolioBreakdown());

        expect(result.current.assets).toEqual([]);
        expect(result.current.loading).toBe(true);
    });

    it("should load assets", async () => {
        server.use(requestMockOnce(`${BASE_URL}/tokens/breakdown`, new TokenPortfolioDataFactory().createMany(3)));
        const { result } = renderHook(() => usePortfolioBreakdown());

        expect(result.current.assets).toEqual([]);
        expect(result.current.loading).toBe(true);

        act(() => {
            void result.current.loadBreakdown();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.assets).toHaveLength(3);
    });
});
