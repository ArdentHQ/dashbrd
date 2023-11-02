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
    isSaving: boolean;
    draft: GalleryDraft;
    setDraftCover: (image: ArrayBuffer | null, type: string | null) => void;
    setDraftNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    setDraftTitle: (title: string) => void;
    deleteDraft: () => Promise<void>;
    walletDrafts: GalleryDraft[];
    loadingWalletDrafts: boolean;
}

const initialGalleryDraft: GalleryDraft = {
    title: "",
    cover: null,
    coverType: null,
    nfts: [],
    id: null,
};

export const useGalleryDrafts = (givenDraftId?: number, disabled?: boolean): GalleryDraftsState => {
    const { wallet } = useAuth();

    const database = useIndexedDB("gallery-drafts");

    const [draft, setDraft] = useState<GalleryDraft>({
        ...initialGalleryDraft,
        walletAddress: wallet?.address,
    });

    const [loadingWalletDrafts, setLoadingWalletDrafts] = useState<boolean>(true);
    const [walletDrafts, setWalletDrafts] = useState<GalleryDraft[]>([]);

    const [save, setSave] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [reachedLimit, setReachedLimit] = useState(false);

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

    useEffect(() => {
        const loadWalletDrafts = async (): Promise<void> => {
            const drafts = await getWalletDrafts();
            setWalletDrafts(drafts);

            setLoadingWalletDrafts(false);
        };

        void loadWalletDrafts();
    }, []);

    const saveDraft = async (): Promise<void> => {
        setIsSaving(true);

        if (draft.id === null) {
            const walletDrafts = await getWalletDrafts();

            if (walletDrafts.length >= MAX_DRAFT_LIMIT_PER_WALLET) {
                setIsSaving(false);
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

    const deleteDraft = async (): Promise<void> => {
        if (draft.id === null) return;
        await database.deleteRecord(draft.id);

        setReachedLimit(false);
    };

    return {
        reachedLimit,
        isSaving,
        draft,
        setDraftCover,
        setDraftNfts,
        setDraftTitle,
        deleteDraft,
        walletDrafts,
        loadingWalletDrafts,
    };
};
