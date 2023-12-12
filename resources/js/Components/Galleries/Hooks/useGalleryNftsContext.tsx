import { createContext, useContext } from "react";
import { useGalleryNtfs } from "@/Components/Galleries/Hooks/useGalleryNtfs";

export interface GalleryNftsState {
    nfts: App.Data.Gallery.GalleryNftData[];
    remainingCollectionCount: () => number;
    loadMoreCollections: (showHidden: boolean, query?: string) => void;
    loadingCollections: boolean;
    isSearchingCollections: boolean;
    allNftsLoaded: (nft: App.Data.Gallery.GalleryNftData) => boolean;
    loadMoreNfts: (nft: App.Data.Gallery.GalleryNftData) => void;
    loadingNfts: (nft: App.Data.Gallery.GalleryNftData) => boolean;
    getLoadingNftsCount: (nft: App.Data.Gallery.GalleryNftData) => number;
    searchNfts: (showHidden: boolean, query?: string) => Promise<void>;
}

interface GalleryNftsProperties {
    children: React.ReactNode;
    nftsPerPage?: number;
    collectionsPerPage?: number;
}

export interface CollectionsPageMeta {
    total: number;
    next_page_url: string | null;
    first_page_url: string;
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

export const GalleryNfts = ({ children, nftsPerPage, collectionsPerPage }: GalleryNftsProperties): JSX.Element => {
    const galleryNtfs = useGalleryNtfs({ nftsPerPage, collectionsPerPage });

    return (
        <GalleryNftsContext.Provider
            value={galleryNtfs}
            data-testid="GalleryNfts"
        >
            {children}
        </GalleryNftsContext.Provider>
    );
};
