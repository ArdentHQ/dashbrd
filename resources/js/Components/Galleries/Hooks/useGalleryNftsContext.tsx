import { createContext, useContext } from "react";
import { useGalleryNtfs } from "@/Components/Galleries/Hooks/useGalleryNtfs";

export interface GalleryNftsState {
    nfts: App.Data.Gallery.GalleryNftData[];
    remainingCollectionCount: () => number;
    loadMoreCollections: (query?: string) => void;
    loadingCollections: boolean;
    isSearchingCollections: boolean;
    allNftsLoaded: (nft: App.Data.Gallery.GalleryNftData) => boolean;
    loadMoreNfts: (nft: App.Data.Gallery.GalleryNftData) => void;
    loadingNfts: (nft: App.Data.Gallery.GalleryNftData) => boolean;
    getLoadingNftsCount: (nft: App.Data.Gallery.GalleryNftData) => number;
    searchNfts: (query?: string) => Promise<void>;
}

interface GalleryNftsProperties {
    children: React.ReactNode;
    nfts: App.Data.Gallery.GalleryNftData[];
    pageMeta?: Partial<CollectionsPageMeta>;
    nftsPerPage?: number;
}

export interface CollectionsPageMeta {
    total: number;
    next_page_url: string | null;
    first_page_url?: string | null;
    per_page: number;
}

export const GalleryNftsContext = createContext<GalleryNftsState | undefined>(undefined);

export const useGalleryNftsContext = (): GalleryNftsState => {
    const context = useContext(GalleryNftsContext);

    if (context === undefined) {
        throw new Error("useGalleryNftsContext must be within GalleryNftsContext.Provider");
    }

    return context;
};

export const GalleryNfts = ({ children, nfts, pageMeta, nftsPerPage }: GalleryNftsProperties): JSX.Element => {
    const galleryNtfs = useGalleryNtfs({ nfts, pageMeta, nftsPerPage });

    return (
        <GalleryNftsContext.Provider
            value={galleryNtfs}
            data-testid="GalleryNfts"
        >
            {children}
        </GalleryNftsContext.Provider>
    );
};
