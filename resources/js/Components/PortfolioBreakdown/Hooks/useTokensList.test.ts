/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useTokensList } from "./useTokensList";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
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

describe("useTokensList", () => {
    it("should return an empty list of tokens", () => {
        const { result } = renderHook(() => useTokensList());

        expect(result.current.tokens).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.loadingMore).toBe(false);
    });

    it("should load the tokens", async () => {
        server.use(
            requestMockOnce(`${BASE_URL}/tokens/list`, buildPagination(new TokenListItemDataFactory().createMany(3))),
        );

        const { result } = renderHook(() => useTokensList());

        act(() => {
            void result.current.loadTokens();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(3);
    });

    it("should load more tokens", async () => {
        server.use(
            requestMockOnce(
                `${BASE_URL}/tokens/list`,
                buildPagination(new TokenListItemDataFactory().createMany(3), {
                    next_page_url: `${BASE_URL}/tokens/list?page=2`,
                }),
            ),
        );

        const { result } = renderHook(() => useTokensList());

        act(() => {
            void result.current.loadTokens();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(3);

        server.use(
            requestMockOnce(
                `${BASE_URL}/tokens/list`,
                buildPagination(new TokenListItemDataFactory().createMany(3), {
                    next_page_url: `${BASE_URL}/tokens/list?page=2`,
                }),
            ),
        );

        act(() => {
            result.current.loadMoreTokens();
        });

        await waitFor(() => {
            expect(result.current.loadingMore).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.loadingMore).toBe(false);
        });

        expect(result.current.tokens.length).toBe(6);
    });

    it("should not load more tokens if next_page_url is null", async () => {
        server.use(
            requestMockOnce(
                `${BASE_URL}/tokens/list`,
                buildPagination(new TokenListItemDataFactory().createMany(3), {
                    next_page_url: null,
                }),
            ),
        );

        const { result } = renderHook(() => useTokensList());

        act(() => {
            void result.current.loadTokens();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
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
            result.current.loadMoreTokens();
        });

        await waitFor(() => {
            expect(result.current.loadingMore).toBe(false);
        });

        expect(result.current.tokens.length).toBe(3);
    });

    it("should load more tokens", async () => {
        server.use(
            requestMockOnce(
                `${BASE_URL}/tokens/list`,
                buildPagination(new TokenListItemDataFactory().createMany(3), {
                    next_page_url: `${BASE_URL}/tokens/list?page=2`,
                }),
            ),
        );

        const { result } = renderHook(() => useTokensList());

        act(() => {
            void result.current.loadTokens();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(3);

        server.use(
            requestMockOnce(
                `${BASE_URL}/tokens/list`,
                // returning 4 instead of 3 to ensure data was modified, no
                // real case scenario would return a different number of items
                buildPagination(new TokenListItemDataFactory().createMany(4), {
                    next_page_url: `${BASE_URL}/tokens/list?page=2`,
                }),
            ),
        );

        act(() => {
            void result.current.reloadAllTokens();
        });

        await waitFor(() => {
            expect(result.current.tokens.length).toBe(4);
        });
    });

    it("should update sort", async () => {
        const pagination = buildPagination(new TokenListItemDataFactory().createMany(3), {
            next_page_url: `${BASE_URL}/tokens/list?page=2`,
        });

        server.use(requestMockOnce(`${BASE_URL}/tokens/list`, { ...pagination, meta: undefined }));

        const { result } = renderHook(() => useTokensList());

        act(() => {
            void result.current.loadTokens();
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
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
            result.current.updateSort("symbol", "asc");
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(4);

        act(() => {
            result.current.updateSort("symbol", "desc");
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(true);
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tokens.length).toBe(4);
    });
});
