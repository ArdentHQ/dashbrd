import { router } from "@inertiajs/react";
import { GalleryDraftDeleteButton } from "./GalleryDraftDeleteButton";
import { type GalleryDraft, useWalletDraftGalleries } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import { render, renderHook, screen, userEvent, waitFor } from "@/Tests/testing-library";
import * as ToastsHook from "@/Hooks/useToasts";

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

describe("GalleryDraftDeleteButton", () => {
    it("opens the confirmation dialog when delete button is pressed", async () => {
        render(<GalleryDraftDeleteButton draftId={1} />);

        expect(screen.getByTestId("GalleryActionToolbar__draftDelete")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("GalleryActionToolbar__draftDelete"));

        expect(screen.getByTestId("ConfirmationDialog__confirm")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("ConfirmationDialog__close"));

        expect(screen.queryByTestId("ConfirmationDialog__confirm")).not.toBeInTheDocument();
    });

    it("removes from draft when submitted", async () => {
        const { result } = renderHook(() => useWalletDraftGalleries({ address: "mockedAddress" }));

        await waitFor(() => {
            expect(result.current.drafts).toHaveLength(1);
        });

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation((_, options) => {
            // @ts-ignore
            options?.onFinish();
        });

        const showToastMock = vi.fn();

        vi.spyOn(ToastsHook, "useToasts").mockImplementation(() => ({
            showToast: showToastMock,
            clear: vi.fn(),
        }));

        render(<GalleryDraftDeleteButton draftId={1} />);

        await userEvent.click(screen.getByTestId("GalleryActionToolbar__draftDelete"));

        await userEvent.click(screen.getByTestId("ConfirmationDialog__confirm"));

        expect(routerSpy).toBeCalledTimes(1);
        expect(showToastMock).toBeCalledTimes(1);
    });
});
