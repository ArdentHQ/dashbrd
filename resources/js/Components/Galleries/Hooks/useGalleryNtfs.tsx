import { groupBy } from "@ardenthq/sdk-helpers";
import axios from "axios";
import { useMemo, useState } from "react";
import GalleryNftData = App.Data.Gallery.GalleryNftData;
import { type CollectionsPageMeta, type GalleryNftsState } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import { isTruthy } from "@/Utils/is-truthy";

type NftData = App.Data.Gallery.GalleryNftData;

interface CollectionsResponse {
    collections: App.Data.Gallery.GalleryCollectionsData;
    nfts: App.Data.Gallery.GalleryNftData[];
}

interface NftsResponse {
    nfts: App.Data.Gallery.GalleryNftData[];
}

interface GalleryNftsProperties {
    nfts: App.Data.Gallery.GalleryNftData[];
    pageMeta?: Partial<CollectionsPageMeta>;
    nftsPerPage?: number;
}

interface NftsPageMetaState {
    isLoading: boolean;
    currentPage: number;
}

type NftsPageMeta = Record<string, NftsPageMetaState>;
const makeNftPageMeta = (collectionSlugs: string[]): NftsPageMeta => {
    const meta: NftsPageMeta = {};

    for (const slug of collectionSlugs) {
        meta[slug] = {
            isLoading: false,
            currentPage: 1,
        };
    }

    return meta;
};
export const useGalleryNtfs = ({
    nfts: loadedNfts,
    pageMeta: collectionMeta,
    nftsPerPage: nftCountPerPage,
}: GalleryNftsProperties): GalleryNftsState => {
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [isSearchingCollections, setIsSearchingCollections] = useState(false);

    const [nfts, setNfts] = useState<GalleryNftData[]>(loadedNfts);

    const collections = useMemo(
        () => groupBy(nfts, (nft: App.Data.Gallery.GalleryNftData) => nft.collectionSlug),
        [nfts.length],
    ) as Record<string, NftData[]>;

    const [pageMeta, setPageMeta] = useState<CollectionsPageMeta>({
        first_page_url: collectionMeta?.first_page_url,
        per_page: collectionMeta?.per_page ?? 10,
        next_page_url: collectionMeta?.next_page_url ?? null,
        total: collectionMeta?.total ?? 0,
    });

    const nftsPerPage = nftCountPerPage ?? 10;

    const [nftsPageMeta, setNftsPageMeta] = useState<NftsPageMeta>(() => makeNftPageMeta(Object.keys(collections)));

    const loadMoreNfts = (nft: GalleryNftData): void => {
        const { isLoading, currentPage } = nftsPageMeta[nft.collectionSlug];

        if (!isLoading && !allNftsLoaded(nft)) {
            void fetchNfts(currentPage + 1, nft);
        }
    };

    const updateNftPageMetaState = (nft: GalleryNftData, state: NftsPageMetaState): void => {
        setNftsPageMeta({
            ...nftsPageMeta,
            ...{
                [nft.collectionSlug]: state,
            },
        });
    };

    const fetchNfts = async (nextPage: number, nft: GalleryNftData): Promise<NftsResponse> => {
        const { currentPage } = nftsPageMeta[nft.collectionSlug];

        updateNftPageMetaState(nft, {
            isLoading: true,
            currentPage,
        });

        const { data } = await axios.get<NftsResponse>(
            route("my-galleries.nfts", { slug: nft.collectionSlug, page: nextPage }),
        );

        setNfts([...nfts, ...data.nfts]);

        updateNftPageMetaState(nft, {
            isLoading: false,
            currentPage: nextPage,
        });

        return data;
    };

    const getRemainingNftCount = (nft: GalleryNftData): number => {
        const { collectionSlug } = nft;

        const collectionNfts = collections[collectionSlug][0].collectionNftCount;

        const loadedNfts = nfts.filter(({ collectionSlug: slug }) => slug === collectionSlug);

        return collectionNfts - loadedNfts.length;
    };

    const allNftsLoaded = (nft: GalleryNftData): boolean => getRemainingNftCount(nft) === 0;

    const getLoadingNftsCount = (nft: GalleryNftData): number => {
        if (!loadingNfts(nft)) return 0;

        const remainingNfts = getRemainingNftCount(nft);

        return remainingNfts > nftsPerPage ? nftsPerPage : remainingNfts;
    };

    const loadingNfts = (nft: GalleryNftData): boolean => nftsPageMeta[nft.collectionSlug].isLoading;

    const remainingCollectionCount = (): number => {
        const collectionsLength = Object.keys(collections).length;

        if (!isTruthy(pageMeta.next_page_url)) {
            return 0;
        }

        return pageMeta.total - collectionsLength >= pageMeta.per_page
            ? pageMeta.per_page
            : pageMeta.total - collectionsLength;
    };

    const loadMoreCollections = (query?: string): void => {
        const nextPageUrl = pageMeta.next_page_url;

        if (!loadingCollections && nextPageUrl !== null) {
            void fetchCollections(nextPageUrl, query);
        }
    };

    const fetchCollections = async (nextPageUrl: string, query?: string): Promise<CollectionsResponse> => {
        setLoadingCollections(true);

        // let url = new URLSearchParams(nextPageUrl);
        const url = new URL(nextPageUrl);

        if (query !== undefined) {
            url.searchParams.append("query", query);
        }

        const { data } = await axios.get<CollectionsResponse>(decodeURIComponent(url.toString()), {
            requestId: "gallery-page",
        });

        setPageMeta(data.collections.paginated.meta);

        setNftsPageMeta({
            ...nftsPageMeta,
            ...makeNftPageMeta(data.nfts.map(({ collectionSlug }) => collectionSlug)),
        });

        let existingNfts = nfts;

        if (nextPageUrl === pageMeta.first_page_url) {
            existingNfts = [];
        }

        setNfts([...existingNfts, ...data.nfts]);

        setLoadingCollections(false);

        return data;
    };

    const searchNfts = async (query?: string): Promise<void> => {
        if (!isTruthy(pageMeta.first_page_url)) {
            throw new Error("[searchNfts] First page url is not defined.");
        }

        setIsSearchingCollections(true);
        await fetchCollections(pageMeta.first_page_url, query);
        setIsSearchingCollections(false);
    };

    return {
        nfts,
        loadMoreCollections,
        loadingCollections,
        loadingNfts,
        remainingCollectionCount,
        allNftsLoaded,
        loadMoreNfts,
        getLoadingNftsCount,
        isSearchingCollections,
        searchNfts,
    };
};
