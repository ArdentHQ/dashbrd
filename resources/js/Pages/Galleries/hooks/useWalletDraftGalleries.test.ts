import { expect } from "vitest";
import { GalleryDraft, useWalletDraftGalleries } from "./useWalletDraftGalleries";
import { renderHook, waitFor } from "@/Tests/testing-library";
import { act } from "react-dom/test-utils";

const defaultGalleryDraft = {
    id: 1,
    title: "",
    cover: null,
    coverType: null,
    nfts: [],
    walletAddress: "mockedAddress",
    value: "test",
    collectionsCount: 1,
    updatedAt: new Date().getTime(),
};

const drafts: GalleryDraft[] = [defaultGalleryDraft];

const indexedDBMocks = {
    add: (draft: GalleryDraft) => {
        const id = drafts.length + 1;
        drafts.push({ ...draft, id });
        return Promise.resolve(id);
    },
    getAll: async () => {
        return Promise.resolve(drafts);
    },
    update: async (draft: GalleryDraft) => {
        const index = drafts.findIndex((savedDraft) => savedDraft.id === draft.id);
        drafts.splice(index, 1, draft);

        return Promise.resolve(draft);
    },
    deleteRecord: async (id: number) => {
        const index = drafts.findIndex((savedDraft) => savedDraft.id === id);
        delete drafts[index];
    },
    getByID: async (id: number | null) => {
        return Promise.resolve(drafts.find((draft) => draft.id === id));
    },
    openCursor: vi.fn(),
    getByIndex: vi.fn(),
    clear: vi.fn(),
};

const mocks = vi.hoisted(() => ({
    useIndexedDB: () => indexedDBMocks,
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
                nfts: [],
                walletAddress: "mockedAddress",
                value: "test",
                collectionsCount: 1,
                updatedAt: new Date().getTime(),
            });
        });

        expect(result.current.isSaving).toBe(false);

        expect(result.current.findById(2)).resolves.toMatchObject(expect.objectContaining({ title: "Second Test" }));
    });

    it("should update existing draft gallery if id is provided", async () => {
        const { result } = renderHook(() => useWalletDraftGalleries({ address: "mockedAddress" }));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await waitFor(() => {
            expect(result.current.drafts).toHaveLength(2);
        });

        await act(async () => {
            await result.current.upsert({
                id: 1,
                title: "Test",
                cover: null,
                coverType: null,
                nfts: [],
                walletAddress: "mockedAddress",
                value: "test",
                collectionsCount: 1,
                updatedAt: new Date().getTime(),
            });
        });

        expect(result.current.isSaving).toBe(false);
        expect(result.current.drafts).toHaveLength(2);

        expect(result.current.findById(1)).resolves.toMatchObject(expect.objectContaining({ title: "Test" }));
    });

    it("should remove a gallery", async () => {
        const { result } = renderHook(() => useWalletDraftGalleries({ address: "mockedAddress" }));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await waitFor(() => {
            expect(result.current.drafts).toHaveLength(2);
        });

        await act(async () => {
            await result.current.remove(2);
        });

        expect(result.current.isSaving).toBe(false);
        expect(result.current.drafts).toHaveLength(1);
    });
});
