import { useEffect, useState } from "react";
import { useIndexedDB } from "react-indexed-db-hook";
import { useAuth } from "@/Contexts/AuthContext";

const MAX_DRAFT_LIMIT_PER_WALLET = 6;
interface DraftNft {
    nftId: number;
    image: string;
    collectionSlug: string;
}

interface GalleryDraft {
    title: string;
    cover: ArrayBuffer | null;
    coverType: string | null;
    nfts: DraftNft[];
    walletAddress?: string;
    id: number | null;
}

interface GalleryDraftsState {
    reachedLimit: boolean;
    draft: GalleryDraft;
    setDraftCover: (image: ArrayBuffer | null, type: string | null) => void;
    setDraftNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    setDraftTitle: (title: string) => void;
}

const initialGalleryDraft: GalleryDraft = {
    title: "",
    cover: null,
    coverType: null,
    nfts: [],
    id: null,
};

export const useGalleryDrafts = (givenDraftId?: number): GalleryDraftsState => {
    const { wallet } = useAuth();

    const database = useIndexedDB("gallery-drafts");

    const [draft, setDraft] = useState<GalleryDraft>({
        ...initialGalleryDraft,
        walletAddress: wallet?.address,
    });

    const [save, setSave] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [reachedLimit, setReachedLimit] = useState(false);

    // populate `draft` state if `givenDraftId` is present
    useEffect(() => {
        if (givenDraftId === undefined) return;
        const getDraft = async (): Promise<void> => {
            const draft: GalleryDraft = await database.getByID(givenDraftId);
            if (draft.walletAddress === wallet?.address) {
                setDraft(draft);
            }
        };

        void getDraft();
    }, [givenDraftId, wallet?.address]);

    useEffect(() => {
        if (!save || isSaving || reachedLimit) return;

        void saveDraft();
    }, [save]);

    const saveDraft = async (): Promise<void> => {
        setIsSaving(true);

        if (draft.id === null) {
            const walletDrafts = await getWalletDrafts();

            if (walletDrafts.length >= MAX_DRAFT_LIMIT_PER_WALLET) {
                setReachedLimit(true);
                return;
            }

            const draftToCreate: Partial<GalleryDraft> = { ...draft };
            delete draftToCreate.id;

            const id = await database.add(draftToCreate);
            setDraft({ ...draft, id });
        } else {
            await database.update(draft);
        }

        setSave(false);
        setIsSaving(false);
    };

    const getWalletDrafts = async (): Promise<GalleryDraft[]> => {
        const allDrafts: GalleryDraft[] = await database.getAll();

        return allDrafts.filter((draft) => draft.walletAddress === wallet?.address);
    };

    const setDraftCover = (image: ArrayBuffer | null, type: string | null): void => {
        setDraft({ ...draft, cover: image, coverType: type });
        setSave(true);
    };

    const setDraftNfts = (nfts: App.Data.Gallery.GalleryNftData[]): void => {
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

    const setDraftTitle = (title: string): void => {
        setDraft({ ...draft, title });
        setSave(true);
    };

    return {
        reachedLimit,
        draft,
        setDraftCover,
        setDraftNfts,
        setDraftTitle,
    };
};
