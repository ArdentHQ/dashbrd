import { useEffect, useState } from "react";
import { useIndexedDB } from "react-indexed-db-hook";
import { useAuth } from "@/Contexts/AuthContext";

const MAX_DRAFT_LIMIT_PER_WALLET = 6;
const DRAFT_TTL_DAYS = 30;

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
    updatedAt: number | null;
}

interface GalleryDraftsState {
    getDrafts: () => Promise<GalleryDraft[]>;
    reachedLimit: boolean;
    isSaving: boolean;
    draft: GalleryDraft;
    setDraftCover: (image: ArrayBuffer | null, type: string | null) => void;
    setDraftNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    setDraftTitle: (title: string) => void;
    deleteDraft: () => Promise<void>;
    deleteExpiredDrafts: () => Promise<void>;
}

const initialGalleryDraft: GalleryDraft = {
    title: "",
    cover: null,
    coverType: null,
    nfts: [],
    id: null,
    updatedAt: null,
};

export const useGalleryDrafts = (givenDraftId?: number, disabled?: boolean): GalleryDraftsState => {
    const { wallet } = useAuth();

    const database = useIndexedDB("gallery-drafts");

    const [draft, setDraft] = useState<GalleryDraft>({
        ...initialGalleryDraft,
        walletAddress: wallet?.address,
    });

    const [save, setSave] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [reachedLimit, setReachedLimit] = useState(false);

    // if wallet changed reset state
    useEffect(() => {
        if (disabled === true && draft.id === null) return;

        setDraft({
            ...initialGalleryDraft,
            walletAddress: wallet?.address,
        });
        setReachedLimit(false);
    }, [wallet?.address]);

    // populate `draft` state if `givenDraftId` is present
    useEffect(() => {
        if (givenDraftId === undefined || disabled === true) return;

        const getDraft = async (): Promise<void> => {
            const draft: GalleryDraft | undefined = await database.getByID(givenDraftId);
            if (draft !== undefined && draft.walletAddress === wallet?.address) {
                setDraft(draft);
            }
        };

        void getDraft();
    }, [givenDraftId, wallet?.address]);

    useEffect(() => {
        if (disabled === true || !save || isSaving || reachedLimit) return;
        void saveDraft();
    }, [save]);

    const saveDraft = async (): Promise<void> => {
        setIsSaving(true);

        const updatedAt = new Date().getTime();

        if (draft.id === null) {
            const walletDrafts = await getWalletDrafts();

            if (walletDrafts.length >= MAX_DRAFT_LIMIT_PER_WALLET) {
                setIsSaving(false);
                setReachedLimit(true);
                return;
            }

            const draftToCreate: Partial<GalleryDraft> = { ...draft, updatedAt };
            delete draftToCreate.id;

            const id = await database.add(draftToCreate);
            setDraft({ ...draft, id, updatedAt });
        } else {
            await database.update(draft);
            setDraft({ ...draft, updatedAt });
        }

        setSave(false);
        setIsSaving(false);
    };

    const getWalletDrafts = async (): Promise<GalleryDraft[]> => {
        const allDrafts: GalleryDraft[] = await database.getAll();

        return allDrafts.filter((draft) => draft.walletAddress === wallet?.address);
    };

    const setDraftCover = (image: ArrayBuffer | null, type: string | null): void => {
        setDraft((previousDraft) => ({ ...previousDraft, cover: image, coverType: type }));
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
        setDraft((previousDraft) => ({ ...previousDraft, title }));
        setSave(true);
    };

    const deleteDraft = async (): Promise<void> => {
        if (draft.id === null) return;
        await database.deleteRecord(draft.id);

        setReachedLimit(false);
    };

    const deleteExpiredDrafts = async (): Promise<void> => {
        const thresholdDaysAgo = new Date().getTime() - DRAFT_TTL_DAYS * 86400 * 1000;
        const drafts: GalleryDraft[] = await database.getAll();

        for (const draft of drafts) {
            if ((draft.updatedAt ?? 0) < thresholdDaysAgo) {
                void database.deleteRecord(Number(draft.id));
            }
        }
    };

    return {
        getDrafts: getWalletDrafts,
        reachedLimit,
        isSaving,
        draft,
        setDraftCover,
        setDraftNfts,
        setDraftTitle,
        deleteDraft,
        deleteExpiredDrafts,
    };
};
