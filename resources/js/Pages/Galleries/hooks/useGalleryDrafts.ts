import { useEffect, useState } from "react";
import { useIndexedDB } from "react-indexed-db-hook";
import { useAuth } from "@/Contexts/AuthContext";
import { useDebounce } from "@/Hooks/useDebounce";
import { useIsFirstRender } from "@/Hooks/useIsFirstRender";

interface DraftNft {
    nftId: number;
    image: string;
    collectionSlug: string;
}

interface GalleryDraft {
    title: string;
    cover: ArrayBuffer | null;
    nfts: DraftNft[];
    walletAddress?: string;
    id: number | null;
}

const initialGalleryDraft: GalleryDraft = {
    title: "",
    cover: null,
    nfts: [],
    id: null,
};

export const useGalleryDrafts = (givenDraftId?: number) => {
    const { wallet } = useAuth();

    const database = useIndexedDB("gallery-drafts");

    const [draft, setDraft] = useState<GalleryDraft>({
        ...initialGalleryDraft,
        walletAddress: wallet?.address,
    });

    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState<string>("");
    const [debouncedValue] = useDebounce(title, 400);

    const isFirstRender = useIsFirstRender();

    // populate `draft` state if `givenDraftId` is present
    useEffect(() => {
        if (givenDraftId === undefined) return;
        console.log("getting the draft", givenDraftId);
        const getDraft = async (): Promise<void> => {
            const draft: GalleryDraft = await database.getByID(givenDraftId);

            if (draft.walletAddress === wallet?.address) {
                setDraft(draft);
            }
        };

        void getDraft();
    }, []);

    // persist debounced title
    useEffect(() => {
        if (isFirstRender) return;

        const updatedDraft = { ...draft, title: debouncedValue };

        setDraft(updatedDraft);
        void saveDraft(updatedDraft);
    }, [debouncedValue]);

    console.log("rendered", draft);

    const saveDraft = async (draft: GalleryDraft): Promise<void> => {
        console.log("saving draft");
        if (isSaving) return;

        setIsSaving(true);

        if (draft.id === null) {
            const draftToCreate: Partial<GalleryDraft> = { ...draft };
            delete draftToCreate.id;

            const id = await database.add(draftToCreate);
            setDraft({ ...draft, id });
        } else {
            await database.update(draft);
        }

        setIsSaving(false);
    };

    const setDraftCover = async (image: ArrayBuffer | null): Promise<void> => {
        const updatedDraft = { ...draft, cover: image };
        setDraft(updatedDraft);
        await saveDraft(updatedDraft);
    };

    const setDraftNfts = async (nfts: App.Data.Gallery.GalleryNftData[]): Promise<void> => {
        const updatedDraft = {
            ...draft,
            nfts: nfts.map((nft) => ({
                nftId: nft.id,
                image: nft.images.large ?? "",
                collectionSlug: nft.collectionSlug,
            })),
        };

        setDraft(updatedDraft);

        await saveDraft(updatedDraft);
    };

    return {
        draft,
        setDraftCover,
        setDraftNfts,
        setDraftTitle: setTitle,
    };
};
