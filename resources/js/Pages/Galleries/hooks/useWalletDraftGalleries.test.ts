import { act } from "react-dom/test-utils";
import { expect } from "vitest";
import { type GalleryDraft, useWalletDraftGalleries } from "./useWalletDraftGalleries";
import { renderHook, waitFor } from "@/Tests/testing-library";

const defaultGalleryDraft = {
    id: 1,
    title: "",
    cover: null,
    coverType: null,
    coverFileName: null,
    nfts: [],
    walletAddress: "mockedAddress",
    value: "test",
    collectionsCount: 1,
    updatedAt: new Date().getTime(),
};

const expiredGalleryDraft = {
    id: null,
    title: "",
    cover: null,
    coverType: null,
    coverFileName: null,
    nfts: [],
    walletAddress: "mockedAddress",
    value: "test",
    collectionsCount: 1,
    updatedAt: 169901639000,
};

interface IndexedDBMockResponse {
    add: (draft: GalleryDraft) => Promise<number>;
    getAll: () => Promise<GalleryDraft[]>;
    update: (draft: GalleryDraft) => Promise<GalleryDraft>;
    deleteRecord: (id: number) => Promise<void>;
    getByID: (id: number | null) => Promise<GalleryDraft | undefined>;
    openCursor: () => void;
    getByIndex: () => void;
    clear: () => void;
}

const useIndexedDBMock = (): IndexedDBMockResponse => {
    const drafts: GalleryDraft[] = [defaultGalleryDraft, expiredGalleryDraft];

    return {
        add: async (draft: GalleryDraft): Promise<number> => {
            const id = drafts.length + 1;
            drafts.push({ ...draft, id });
            return await Promise.resolve(id);
        },
        getAll: async (): Promise<GalleryDraft[]> => await Promise.resolve(drafts),
        update: async (draft: GalleryDraft): Promise<GalleryDraft> => {
            const index = drafts.findIndex((savedDraft) => savedDraft.id === draft.id);
            drafts.splice(index, 1, draft);

            return await Promise.resolve(draft);
        },
        deleteRecord: async (id: number): Promise<void> => {
            const index = drafts.findIndex((savedDraft) => savedDraft.id === id);
            drafts.splice(index, 0);

            await Promise.resolve();
        },
        getByID: async (id: number | null) => await Promise.resolve(drafts.find((draft) => draft.id === id)),
        openCursor: vi.fn(),
        getByIndex: vi.fn(),
        clear: vi.fn(),
    };
};

const mocks = vi.hoisted(() => ({
    useIndexedDB: () => useIndexedDBMock(),
}));

vi.mock("react-indexed-db-hook", () => ({
    useIndexedDB: mocks.useIndexedDB,
}));

describe("useWalletDraftGalleries", () => {
    it("should add a new gallery id is not provided", async () => {
        const { result } = renderHook(() => useWalletDraftGalleries({ address: "mockedAddress" }));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await waitFor(() => {
            expect(result.current.drafts).toHaveLength(1);
        });

        await act(async () => {
            await result.current.upsert({
                title: "Second Test",
                cover: null,
                coverType: null,
                coverFileName: null,
                nfts: [],
                walletAddress: "mockedAddress",
                value: "test",
                collectionsCount: 1,
                updatedAt: new Date().getTime(),
            });
        });

        expect(result.current.isSaving).toBe(false);

        await expect(result.current.findById(3)).resolves.toMatchObject(
            expect.objectContaining({ title: "Second Test" }) as GalleryDraft,
        );
    });

    it("should update existing draft gallery if id is provided", async () => {
        const { result } = renderHook(() => useWalletDraftGalleries({ address: "mockedAddress" }));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await waitFor(() => {
            expect(result.current.drafts).toHaveLength(1);
        });

        await act(async () => {
            await result.current.upsert({
                id: 1,
                title: "Test",
                cover: null,
                coverType: null,
                coverFileName: null,
                nfts: [],
                walletAddress: "mockedAddress",
                value: "test",
                collectionsCount: 1,
                updatedAt: new Date().getTime(),
            });
        });

        expect(result.current.isSaving).toBe(false);
        expect(result.current.drafts).toHaveLength(1);

        await expect(result.current.findById(1)).resolves.toMatchObject(
            expect.objectContaining({ title: "Test" }) as GalleryDraft,
        );
    });

    it("should remove a gallery", async () => {
        const { result } = renderHook(() => useWalletDraftGalleries({ address: "mockedAddress" }));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await waitFor(() => {
            expect(result.current.drafts).toHaveLength(1);
        });

        await act(async () => {
            await result.current.remove(1);
        });

        expect(result.current.isSaving).toBe(false);
        expect(result.current.drafts).toHaveLength(1);
    });

    it("should remove expired galleries", async () => {
        const { result } = renderHook(() => useWalletDraftGalleries({ address: "mockedAddress" }));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await expect(result.current.findById(1)).resolves.toMatchObject(
            expect.objectContaining({ title: "" }) as GalleryDraft,
        );

        await act(async () => {
            await result.current.removeExpired();
        });

        expect(result.current.isSaving).toBe(false);
        expect(result.current.drafts).toHaveLength(1);
    });
});
