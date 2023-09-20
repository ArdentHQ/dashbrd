import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useWalletTokens } from "./useWalletTokens";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { BASE_URL, requestMock, requestMockOnce, server } from "@/Tests/Mocks/server";
import { act, renderHook, waitFor } from "@/Tests/testing-library";

const buildPagination = (
    data: App.Data.TokenListItemData[],
    meta = {},
): PaginationData<App.Data.TokenListItemData> => ({
    data,
    links: [
        {
            url: "http://test.test",
            label: "test",
            active: true,
        },
    ],
    meta: {
        current_page: 1,
        first_page_url: "http://test.test",
        from: 1,
        last_page: 1,
        last_page_url: "http://test.test",
        next_page_url: null,
        path: "test",
        per_page: 10,
        prev_page_url: null,
        to: 1,
        total: 10,
        ...meta,
    },
});

describe("useWalletTokens", () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const wallet = new WalletFactory().create();

    it("should load the tokens", async () => {
        server.use(
            requestMockOnce(`${BASE_URL}/tokens/list`, buildPagination(new TokenListItemDataFactory().createMany(3))),
        );

        const { result } = renderHook(() => useWalletTokens(wallet), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.tokens.length).toBeGreaterThan(0);
    });

    it("should load more tokens", async () => {
        server.use(
            requestMockOnce(`${BASE_URL}/tokens/list`, buildPagination(new TokenListItemDataFactory().createMany(3))),
        );

        const { result } = renderHook(() => useWalletTokens(wallet), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.tokens.length).toBeGreaterThan(0);

        server.use(
            requestMockOnce(
                `${BASE_URL}/tokens/list`,
                buildPagination(new TokenListItemDataFactory().createMany(3), {
                    next_page_url: null,
                }),
            ),
        );

        act(() => {
            result.current.loadMore();
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });

    it("should not load more tokens if next_page_url is null", async () => {
        const wallet = new WalletFactory().create();

        server.use(
            requestMockOnce(
                `${BASE_URL}/tokens/list`,
                buildPagination(new TokenListItemDataFactory().createMany(3), {
                    next_page_url: null,
                }),
            ),
        );

        const { result } = renderHook(() => useWalletTokens(wallet), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(3);

        server.use(
            requestMockOnce(
                `${BASE_URL}/tokens/list`,
                buildPagination(new TokenListItemDataFactory().createMany(3), {
                    next_page_url: null,
                }),
            ),
        );

        act(() => {
            result.current.loadMore();
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(3);
    });

    it("should update sort", async () => {
        const wallet = new WalletFactory().create();
        const pagination = buildPagination(new TokenListItemDataFactory().createMany(3), {
            next_page_url: `${BASE_URL}/tokens/list?page=2`,
        });

        server.use(requestMockOnce(`${BASE_URL}/tokens/list`, { ...pagination, meta: undefined }));

        const { result } = renderHook(() => useWalletTokens(wallet), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(3);

        server.use(
            requestMock(
                `${BASE_URL}/tokens/list`,
                // returning 4 instead of 3 to ensure data was modified, no
                // real case scenario would return a different number of items
                buildPagination(new TokenListItemDataFactory().createMany(4), {
                    next_page_url: `${BASE_URL}/tokens/list?page=2`,
                }),
            ),
        );

        act(() => {
            result.current.updateSortOptions("symbol", "asc");
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(4);

        act(() => {
            result.current.updateSortOptions("symbol", "desc");
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(4);
    });

    it("should return an empty list of tokens", async () => {
        server.resetHandlers();

        const { result } = renderHook(() => useWalletTokens(), { wrapper });

        await waitFor(() => {
            expect(result.current.tokens).toEqual([]);
        });
    });
});
