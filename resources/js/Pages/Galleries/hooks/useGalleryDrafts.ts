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
}

const initialGalleryDraft: GalleryDraft = {
    title: "",
    cover: null,
    nfts: [],
};

export const useGalleryDrafts = (givenDraftId?: number) => {
    const { wallet } = useAuth();

    const database = useIndexedDB("gallery-drafts");

    const [draft, setDraft] = useState<GalleryDraft | null>(null);
    const [draftId, setDraftId] = useState<number | null>(givenDraftId ?? null);

    const [save, setSave] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [title, setTitle] = useState<string>("");
    const [debouncedValue] = useDebounce(title, 400);

    // populate `draft` state if `draftId` is present
    useEffect(() => {
        if (draft === null && draftId !== null) {
            const getDraft = async (): Promise<void> => {
                const draft: GalleryDraft = await database.getByID(draftId);
                console.log(draft);
                setDraft(draft);
            };

            void getDraft();
        }
    }, []);

    // persist debounced title
    useEffect(() => {
        if (draft === null) return;

        setDraft({ ...draft, title: debouncedValue });
        setSave(true);
    }, [debouncedValue]);

    // initialize an initial `draft` state
    useEffect(() => {
        if (save && draftId === null) {
            const initializeDraft = async (): Promise<void> => {
                const data: GalleryDraft = {
                    ...initialGalleryDraft,
                    walletAddress: wallet?.address,
                };

                const id = await database.add(data);

                setDraftId(id);
                setDraft(data);
            };

            void initializeDraft();
        }
    }, [save, draftId]);

    // update persisted draft
    useEffect(() => {
        if (!save || draftId === null || isSaving) return;

        setIsSaving(true);

        const saveDraft = async (): Promise<void> => {
            await database.update({
                ...draft,
                id: draftId,
            });
            setSave(false);
            setIsSaving(false);
        };

        void saveDraft();
    }, [save]);

    const setDraftTitle = (title: string): void => {
        setTitle(title);
    };

    const setDraftCover = (image: ArrayBuffer | null): void => {
        draft != null && setDraft({ ...draft, cover: image });
        setSave(true);
    };

    const setDraftNfts = (nfts: App.Data.Gallery.GalleryNftData[]): void => {
        draft != null &&
            setDraft({
                ...draft,
                nfts: nfts.map((nft) => ({
                    nftId: nft.id,
                    image: nft.images.large ?? "",
                    collectionSlug: nft.collectionSlug,
                })),
            });

        setSave(true);
    };

    return {
        draftId,
        draft,
        setDraftCover,
        setDraftNfts,
        setDraftTitle,
    };
};
