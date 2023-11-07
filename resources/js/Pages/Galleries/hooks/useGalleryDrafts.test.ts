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
    updatedAt: 169901639000,
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

describe("useGalleryDrafts", () => {
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

    it("should load stored galleries", async () => {
        const mockedDrafts = Array.from({ length: 6 }).fill({ walletAddress: "mockedAddress" });

        mocks.useIndexedDB().getAll.mockReturnValue(mockedDrafts);

        const { result } = renderHook(() => useGalleryDrafts());

        expect(result.current.loadingWalletDrafts).toBe(true);

        await waitFor(() => {
            expect(result.current.loadingWalletDrafts).toBe(false);
        });

        expect(result.current.walletDrafts).toEqual(mockedDrafts);
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

    it("should try to create a new record if draft hasn't been created yet", async () => {
        mocks.useIndexedDB().add.mockResolvedValue(2);

        const { result } = renderHook(() => useGalleryDrafts());

        act(() => {
            result.current.setDraftTitle("hello");
        });

        await waitFor(() => {
            expect(result.current.draft.id).toBe(2);
        });
    });

    it("should not create a new draft if disabled", async () => {
        mocks.useIndexedDB().add.mockResolvedValue(2);

        const { result } = renderHook(() => useGalleryDrafts(undefined, true));

        act(() => {
            result.current.setDraftTitle("hello");
        });

        await waitFor(() => {
            expect(result.current.draft.id).toBe(null);
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

    it("should not add new draft if reached to the limit", async () => {
        const addMock = vi.fn();

        mocks.useIndexedDB().getAll.mockReturnValue(Array.from({ length: 6 }).fill({ walletAddress: "mockedAddress" }));
        mocks.useIndexedDB().add.mockImplementation(addMock);

        const { result } = renderHook(() => useGalleryDrafts());

        act(() => {
            result.current.setDraftTitle("hello");
        });

        await waitFor(() => {
            expect(addMock).not.toHaveBeenCalled();
            expect(result.current.reachedLimit).toBe(true);
            expect(result.current.isSaving).toBe(false);
        });
    });

    it("should delete the draft if id is present", async () => {
        const givenDraftId = 2;

        const deleteMock = vi.fn();

        mocks.useIndexedDB().getByID.mockResolvedValue({ ...defaultGalleryDraft, id: givenDraftId });
        mocks.useIndexedDB().deleteRecord.mockImplementation(deleteMock);

        const { result } = renderHook(() => useGalleryDrafts(givenDraftId));

        await waitFor(() => {
            expect(result.current.draft.id).toBe(givenDraftId);
        });

        await act(async () => {
            await result.current.deleteDraft();
        });

        await waitFor(() => {
            expect(deleteMock).toHaveBeenCalled();
            expect(result.current.reachedLimit).toBe(false);
        });
    });

    it("should not delete the draft if id is not present", async () => {
        const deleteMock = vi.fn();

        mocks.useIndexedDB().deleteRecord.mockImplementation(deleteMock);

        const { result } = renderHook(() => useGalleryDrafts());

        await act(async () => {
            await result.current.deleteDraft();
        });

        expect(deleteMock).not.toHaveBeenCalled();
    });

    it("should delete expired drafts", async () => {
        const deleteMock = vi.fn();

        const date = new Date(2023, 10, 4);

        vi.useFakeTimers();
        vi.setSystemTime(date);

        mocks.useIndexedDB().deleteRecord.mockImplementation(deleteMock);
        mocks.useIndexedDB().getAll.mockReturnValue([
            { updatedAt: 1693833267000, id: 1 }, // 4 Sep 2023
            { updatedAt: 1667481267241, id: 2 }, // 3 Nov 2022
            { updatedAt: 1699019421000, id: 3 }, // 4 Nov 2023
        ]);

        const { result } = renderHook(() => useGalleryDrafts());

        await act(async () => {
            await result.current.deleteExpiredDrafts();
        });

        expect(deleteMock).toHaveBeenCalledTimes(2);

        expect(deleteMock).toHaveBeenCalledWith(1);
        expect(deleteMock).toHaveBeenCalledWith(2);

        vi.useRealTimers();
    });
});
