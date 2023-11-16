import { useEffect, useState } from "react";
import { type GalleryDraft, useWalletDraftGalleries } from "./useWalletDraftGalleries";
import { isTruthy } from "@/Utils/is-truthy";

interface WalletDraftGalleryState {
    isSaving: boolean;
    draft: GalleryDraft;
    setCover: (image: ArrayBuffer | null, name: string | null, type: string | null) => void;
    setNfts: (nfts: App.Data.Gallery.GalleryNftData[]) => void;
    setTitle: (title: string) => void;
    reset: (draft?: Partial<GalleryDraft>) => void;
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

    const [draft, setDraft] = useState<GalleryDraft>(defaultDraft);

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

    const saveDraft = async (draft: GalleryDraft): Promise<void> => {
        if (isTruthy(isDisabled)) {
            setIsLoading(false);
            return;
        }

        if (isTruthy(draft.walletAddress) && draft.walletAddress !== address) {
            throw new Error("[useWalletDraftGallery:saveDraft] Trying to save draft that belongs to another wallet.");
        }

        const savedDraft = await upsert({ ...draft, walletAddress: address });
        console.log("saved draft", saveDraft);

        setDraft(savedDraft);
    };

    const setCover = (image: ArrayBuffer | null, name: string | null, type: string | null): void => {
        void saveDraft({ ...draft, cover: image, coverType: type, coverFileName: name });
    };

    const setTitle = (title: string): void => {
        void saveDraft({ ...draft, title });
    };

    const reset = (draft?: Partial<GalleryDraft>): void => {
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
