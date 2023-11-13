import { useEffect, useState } from "react";
import { type GalleryDraft, useWalletDraftGalleries } from "./useWalletDraftGalleries";

interface WalletDraftGalleryState {
    isSaving: boolean;
    draft: GalleryDraft;
    setCover: (image: ArrayBuffer | null, name: string | null, type: string | null) => void;
    setNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    setTitle: (title: string) => void;
    isLoading: boolean;
}

export const useWalletDraftGallery = ({
    address,
    draftId,
    isDisabled,
}: {
    address: string;
    draftId?: number | string;
    isDisabled?: boolean;
}): WalletDraftGalleryState => {
    const [isLoading, setIsLoading] = useState(true);
    const { upsert, findById, isSaving } = useWalletDraftGalleries({ address });

    const [draft, setDraft] = useState<GalleryDraft>({
        title: "",
        cover: null,
        coverType: null,
        coverFileName: null,
        nfts: [],
        value: null,
        collectionsCount: 0,
        updatedAt: null,
        walletAddress: address,
    });

    // populate `draft` state if `draftId` is present
    useEffect(() => {
        if (draftId === undefined || isDisabled === true) {
            return;
        }

        const getDraft = async (): Promise<void> => {
            setIsLoading(true);
            const draft = await findById(draftId);

            if (draft !== undefined) {
                setDraft(draft);
            }

            setIsLoading(false);
        };

        void getDraft();
    }, [draftId, address]);

    const saveDraft = async (draft: GalleryDraft): Promise<void> => {
        const savedDraft = await upsert(draft);
        setDraft(savedDraft);
    };

    const setCover = (image: ArrayBuffer | null, name: string | null, type: string | null): void => {
        void saveDraft({ ...draft, cover: image, coverType: type, coverFileName: name });
    };

    const setTitle = (title: string): void => {
        void saveDraft({ ...draft, title });
    };

    const setNfts = (nfts: App.Data.Gallery.GalleryNftData[]): void => {
        void saveDraft({
            ...draft,
            nfts: nfts.map((nft) => ({
                nftId: nft.id,
                image: nft.images.large ?? "",
                collectionSlug: nft.collectionSlug,
            })),
        });
    };

    return {
        setCover,
        setNfts,
        setTitle,
        isSaving,
        draft,
        isLoading,
    };
};
