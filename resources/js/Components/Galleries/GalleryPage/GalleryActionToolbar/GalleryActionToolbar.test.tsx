import React from "react";
import { GalleryActionToolbar } from "./GalleryActionToolbar";
import { render, screen } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";
import { GalleryDraft } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";

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

describe("GalleryActionToolbar", () => {
    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(<GalleryActionToolbar />, { breakpoint });

        expect(screen.getByTestId("GalleryActionToolbar")).toBeInTheDocument();
    });

    it("should render with gallery cover image url", () => {
        render(<GalleryActionToolbar galleryCoverUrl="/test" />);

        expect(screen.getByTestId("Img")).toBeInTheDocument();
        expect(screen.getByTestId("Img")).toHaveAttribute("src", "/test");
    });

    it("should render as processing", () => {
        render(
            <GalleryActionToolbar
                galleryCoverUrl="/test"
                isProcessing
            />,
        );

        expect(screen.getByTestId("GalleryActionToolbar__publish")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryActionToolbar__publish")).toBeDisabled();
    });

    it("should show saving to draft icon", () => {
        render(
            <GalleryActionToolbar
                galleryCoverUrl="/test"
                isProcessing
                isSavingDraft={true}
            />,
        );

        expect(screen.getByTestId("Icon_SavingDraft")).toBeInTheDocument();
    });

    it("should show draft saved icon", () => {
        render(
            <GalleryActionToolbar
                galleryCoverUrl="/test"
                isProcessing
                draftId={1}
                isSavingDraft={false}
            />,
        );

        expect(screen.getByTestId("Icon_DraftSaved")).toBeInTheDocument();
    });

    it.each(allBreakpoints)("should render without delete button in %s screen", (breakpoint) => {
        render(<GalleryActionToolbar showDelete={false} />, { breakpoint });

        expect(screen.queryByTestId("GalleryActionToolbar__delete")).not.toBeInTheDocument();
    });
});
