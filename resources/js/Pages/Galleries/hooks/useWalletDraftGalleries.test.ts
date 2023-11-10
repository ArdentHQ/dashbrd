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

    it("should set", async () => {
        const givenDraftId = 1;

        const { result } = renderHook(() => useGalleryDrafts(givenDraftId));

        await waitFor(() => {
            expect(result.current.draft.id).toBe(givenDraftId);
        });
    });
});
