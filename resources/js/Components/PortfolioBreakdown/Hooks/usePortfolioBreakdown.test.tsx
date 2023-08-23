import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { usePortfolioBreakdown } from "./usePortfolioBreakdown";
import TokenPortfolioDataFactory from "@/Tests/Factories/TokenPortfolioDataFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { renderHook, waitFor } from "@/Tests/testing-library";

describe("usePortfolioBreakdown", () => {
    const queryClient = new QueryClient();

    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it("should return an empty set of assets and loading state initially", () => {
        server.use(requestMockOnce(`${BASE_URL}/tokens/breakdown`, new TokenPortfolioDataFactory().createMany(3)));
        const { result } = renderHook(() => usePortfolioBreakdown(), {
            wrapper,
        });

        expect(result.current.assets).toEqual([]);
        expect(result.current.isLoading).toBe(true);
    });

    it("should load assets", async () => {
        server.use(requestMockOnce(`${BASE_URL}/tokens/breakdown`, new TokenPortfolioDataFactory().createMany(3)));
        const { result } = renderHook(() => usePortfolioBreakdown(), { wrapper });

        expect(result.current.assets).toEqual([]);
        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.assets).toHaveLength(3);
    });
});
