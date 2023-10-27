import { useRef } from "react";
import { useAuth } from "@/Contexts/AuthContext";

interface DraftNft {
    nftId: number;
    image: string;
    collectionSlug: slug;
}

interface GalleryDraft {
    title: string | null;
    cover: string | null;
    nfts: DraftNft[];
}

const initialGalleryDraft: GalleryDraft = {
    title: null,
    cover: null,
    nfts: [],
};

export const useGalleryDraft = (givenDraftId?: string) => {
    const { wallet } = useAuth();

    const draftIdReference = useRef(givenDraftId ?? `gallery-${wallet?.address}-${new Date().getTime()}`);

    const draftId = draftIdReference.current;

    const getDraft = (): GalleryDraft => {
        try {
            const rawDraft = localStorage.getItem(draftId);
            return rawDraft != null ? (JSON.parse(rawDraft) as GalleryDraft) : initialGalleryDraft;
        } catch (error) {
            return initialGalleryDraft;
        }
    };

    const draftReference = useRef(getDraft());

    const draft = draftReference.current;

    const persistDraft = (): void => {
        localStorage.setItem(draftId, JSON.stringify(draft));
    };

    const setTitle = (title: string | null): void => {
        draft.title = title;
        persistDraft();
    };

    const setCover = (image: string | null): void => {
        draft.cover = image;
        persistDraft();
    };

    const setNfts = (nfts: App.Data.Gallery.GalleryNftData[]) => {
        draft.nfts = nfts.map((nft) => ({
            nftId: nft.id,
            image: nft.images.large ?? "",
            collectionSlug: nft.collectionSlug,
        }));
        persistDraft();
    };

    return {
        setTitle,
        setCover,
        setNfts,
    };
};
