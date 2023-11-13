import { expect } from "vitest";
import { useWalletDraftGalleries } from "./useWalletDraftGalleries";
import { renderHook, waitFor } from "@/Tests/testing-library";

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

describe("useWalletDraftGalleries", () => {
    it("should add to galleries", async () => {
        const { result } = renderHook(() => useWalletDraftGalleries({ address: "mockedAddress" }));

        await waitFor(() => {
            expect(result.current.drafts).toHaveLength(0);
        });
    });
});
