import { useEffect, useState } from "react";
import { type GalleryDraftUnsaved, useWalletDraftGalleries } from "./useWalletDraftGalleries";
import { isTruthy } from "@/Utils/is-truthy";

interface WalletDraftGalleryState {
    isSaving: boolean;
    draft: GalleryDraftUnsaved;
    setCover: (image: ArrayBuffer | null, name: string | null, type: string | null) => void;
    setNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    setTitle: (title: string) => void;
    reset: (draft?: Partial<GalleryDraftUnsaved>) => void;
    isLoading: boolean;
}

const defaultDraft = {
    title: "",
    cover: null,
    coverType: null,
    coverFileName: null,
    nfts: [],
    value: null,
    collectionsCount: 0,
    updatedAt: null,
    walletAddress: undefined,
};

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
    const { upsert, findWalletDraftById, isSaving } = useWalletDraftGalleries({ address });

    const [draft, setDraft] = useState<GalleryDraftUnsaved>(defaultDraft);

    useEffect(() => {
        if (draftId === undefined || isDisabled === true) {
            setIsLoading(false);
            return;
        }

        const getDraft = async (): Promise<void> => {
            setIsLoading(true);

            const existingDraft = await findWalletDraftById(draftId);

            if (existingDraft !== undefined) {
                setDraft(existingDraft);
            }

            setIsLoading(false);
        };

        void getDraft();
    }, [draftId, address]);

    const saveDraft = async (draft: GalleryDraftUnsaved): Promise<void> => {
        if (isTruthy(isDisabled)) {
            setIsLoading(false);
            return;
        }

        if (isTruthy(draft.walletAddress) && draft.walletAddress !== address) {
            throw new Error("[useWalletDraftGallery:saveDraft] Trying to save draft that belongs to another wallet.");
        }

        try {
            const savedDraft = await upsert({ ...draft, walletAddress: address });
            setDraft(savedDraft);
        } catch {
            // Ignore any errors that occur on validation when saving.
        }
    };

    const setCover = (image: ArrayBuffer | null, name: string | null, type: string | null): void => {
        void saveDraft({ ...draft, cover: image, coverType: type, coverFileName: name });
    };

    const setTitle = (title: string): void => {
        void saveDraft({ ...draft, title });
    };

    const reset = (draft?: Partial<GalleryDraftUnsaved>): void => {
        setDraft({ ...defaultDraft, ...draft });
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
        reset,
    };
};
