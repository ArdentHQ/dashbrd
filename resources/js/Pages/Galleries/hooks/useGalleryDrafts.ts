import { useEffect, useState } from "react";
import { useIndexedDB } from "react-indexed-db-hook";
import { useAuth } from "@/Contexts/AuthContext";
import { useDebounce } from "@/Hooks/useDebounce";

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

    // populate `draft` state if `draftId` is present
    useEffect(() => {
        if (draft.id === null && givenDraftId != null) {
            const getDraft = async (): Promise<void> => {
                const draft: GalleryDraft = await database.getByID(givenDraftId);
                setDraft(draft);
            };

            void getDraft();
        }
    }, []);

    // persist debounced title
    useEffect(() => {
        setDraft({ ...draft, title: debouncedValue });
        void saveDraft();
    }, [debouncedValue]);

    const saveDraft = async (): Promise<void> => {
        if (isSaving) return;

        setIsSaving(true);

        if (draft.id === null) {
            const id = await database.add(draft);
            setDraft({ ...draft, id });
        } else {
            await database.update(draft);
        }

        setIsSaving(false);
    };

    const setDraftTitle = (title: string): void => {
        setTitle(title);
    };

    const setDraftCover = async (image: ArrayBuffer | null): Promise<void> => {
        setDraft({ ...draft, cover: image });
        await saveDraft();
    };

    const setDraftNfts = async (nfts: App.Data.Gallery.GalleryNftData[]): Promise<void> => {
        setDraft({
            ...draft,
            nfts: nfts.map((nft) => ({
                nftId: nft.id,
                image: nft.images.large ?? "",
                collectionSlug: nft.collectionSlug,
            })),
        });

        await saveDraft();
    };

    return {
        draft,
        setDraftCover,
        setDraftNfts,
        setDraftTitle,
    };
};
