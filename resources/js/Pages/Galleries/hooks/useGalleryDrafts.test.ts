import { expect, type SpyInstance } from "vitest";
import { useGalleryDrafts } from "./useGalleryDrafts";
import * as AuthContextMock from "@/Contexts/AuthContext";

import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { act, renderHook, waitFor } from "@/Tests/testing-library";

let useAuthSpy: SpyInstance;
vi.mock("@/Contexts/AuthContext", () => ({
    useAuth: () => ({ wallet: { address: "mockedWalletAddress" } }),
}));

const defaultGalleryDraft = {
    id: 1,
    walletAddress: "mockedAddress",
    nfts: [],
    title: "",
    cover: null,
    coverTye: null,
};

const indexedDBMocks = {
    add: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    update: vi.fn(),
    deleteRecord: vi.fn(),
    openCursor: vi.fn(),
    getByIndex: vi.fn(),
    clear: vi.fn(),
    getByID: vi.fn().mockResolvedValue(defaultGalleryDraft),
};

const mocks = vi.hoisted(() => ({
    useIndexedDB: () => indexedDBMocks,
}));

vi.mock("react-indexed-db-hook", () => ({
    useIndexedDB: mocks.useIndexedDB,
}));

describe("useGalleryDrafts custom hook", () => {
    beforeAll(() => {
        useAuthSpy = vi.spyOn(AuthContextMock, "useAuth").mockReturnValue({
            user: null,
            wallet: {
                address: "mockedAddress",
                domain: null,
                totalUsd: 1,
                totalBalanceInCurrency: "1",
                totalTokens: 1,
                collectionCount: 1,
                galleryCount: 1,
                timestamps: {
                    tokens_fetched_at: null,
                    native_balances_fetched_at: null,
                },
                isRefreshingCollections: false,
                canRefreshCollections: false,
                avatar: {
                    small: null,
                    default: null,
                    small2x: null,
                },
            },
            authenticated: false,
            signed: false,
            logout: vi.fn(),
            setAuthData: vi.fn(),
        });
    });

    afterAll(() => {
        useAuthSpy.mockRestore();
    });

    it("should populate draft when givenDraftId is provided", async () => {
        const givenDraftId = 1;

        const { result } = renderHook(() => useGalleryDrafts(givenDraftId));

        await waitFor(() => {
            expect(result.current.draft.id).toBe(givenDraftId);
        });
    });

    it("should keep draft in initial state when givenDraftId is irrelevant", async () => {
        mocks.useIndexedDB().getByID.mockResolvedValue({
            ...defaultGalleryDraft,
            walletAddress: "unrelatedAddress",
        });

        const givenDraftId = 1;

        const { result } = renderHook(() => useGalleryDrafts(givenDraftId));

        await waitFor(() => {
            expect(result.current.draft.id).toBe(null);
        });
    });

    it("should try to create a new row if draft hasn't been created yet", async () => {
        mocks.useIndexedDB().add.mockResolvedValue(2);

        const { result } = renderHook(() => useGalleryDrafts());

        act(() => {
            result.current.setDraftTitle("hello");
        });

        await waitFor(() => {
            expect(result.current.draft.id).toBe(2);
        });
    });

    it("should try to update the row if draft is present", async () => {
        const givenDraftId = 2;
        const updateMock = vi.fn();

        mocks.useIndexedDB().getByID.mockResolvedValue({ ...defaultGalleryDraft, id: givenDraftId });
        mocks.useIndexedDB().update.mockImplementation(updateMock);

        const { result } = renderHook(() => useGalleryDrafts(givenDraftId));

        await waitFor(() => {
            expect(result.current.draft.id).toBe(givenDraftId);
        });

        act(() => {
            result.current.setDraftTitle("hello");
        });

        await waitFor(() => {
            expect(updateMock).toHaveBeenCalledOnce();
        });
    });

    it("should update the title", async () => {
        const { result } = renderHook(() => useGalleryDrafts(1));

        act(() => {
            result.current.setDraftTitle("hello");
        });

        await waitFor(() => {
            expect(result.current.draft.title).toBe("hello");
        });
    });

    it("should update the nfts", async () => {
        const { result } = renderHook(() => useGalleryDrafts(1));

        const nft = new GalleryNftDataFactory().create();

        act(() => {
            result.current.setDraftNfts([nft]);
        });

        await waitFor(() => {
            expect(result.current.draft.nfts.length).toBe(1);
        });
    });

    it("should update the cover", async () => {
        const { result } = renderHook(() => useGalleryDrafts(1));

        act(() => {
            result.current.setDraftCover(new ArrayBuffer(8), "png");
        });

        await waitFor(() => {
            expect(result.current.draft.cover).not.toBeNull();
            expect(result.current.draft.coverType).toBe("png");
        });
    });
});
