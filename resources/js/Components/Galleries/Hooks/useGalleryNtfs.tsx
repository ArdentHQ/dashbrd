import { groupBy } from "@ardenthq/sdk-helpers";
import axios from "axios";
import { useMemo, useState } from "react";
import useAbortController from "react-use-cancel-token";
import GalleryNftData = App.Data.Gallery.GalleryNftData;
import { type CollectionsPageMeta, type GalleryNftsState } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
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
    nftsPerPage?: number;
    collectionsPerPage?: number;
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
export const useGalleryNtfs = ({ nftsPerPage, collectionsPerPage }: GalleryNftsProperties): GalleryNftsState => {
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [isSearchingCollections, setIsSearchingCollections] = useState(false);
    const { newAbortSignal, cancelPreviousRequest, isCancel } = useAbortController();
    const { authenticatedAction } = useAuthorizedAction();

    const [nfts, setNfts] = useState<GalleryNftData[]>([]);

    const collections = useMemo(
        () => groupBy(nfts, (nft: App.Data.Gallery.GalleryNftData) => nft.collectionSlug),
        [nfts.length],
    ) as Record<string, NftData[]>;

    const [pageMeta, setPageMeta] = useState<CollectionsPageMeta>({
        total: 0,
        per_page: collectionsPerPage ?? 20,
        next_page_url: route("my-galleries.collections", { page: 1 }),
        first_page_url: route("my-galleries.collections", { page: 1 }),
    });

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

    const fetchNfts = async (nextPage: number, nft: GalleryNftData): Promise<void> => {
        const { currentPage } = nftsPageMeta[nft.collectionSlug];

        updateNftPageMetaState(nft, {
            isLoading: true,
            currentPage,
        });

        await authenticatedAction(async () => {
            const { data } = await axios.get<NftsResponse>(route("my-galleries.nfts", { slug: nft.collectionSlug }), {
                params: {
                    page: nextPage,
                },
            });

            setNfts([...nfts, ...data.nfts]);

            updateNftPageMetaState(nft, {
                isLoading: false,
                currentPage: nextPage,
            });
        });
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

        const nftCountPerPage = nftsPerPage ?? 10;

        return remainingNfts > nftCountPerPage ? nftCountPerPage : remainingNfts;
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

    const loadMoreCollections = (showHidden: boolean, query?: string): void => {
        const nextPageUrl = pageMeta.next_page_url;

        if (!loadingCollections && nextPageUrl !== null) {
            void fetchCollections(nextPageUrl, showHidden, query);
        }
    };

    const fetchCollections = async (nextPageUrl: string, showHidden: boolean, query?: string): Promise<void> => {
        cancelPreviousRequest();

        setLoadingCollections(true);

        const url = new URL(nextPageUrl);

        if (query !== undefined) {
            url.searchParams.append("query", query);
        }

        if (showHidden) {
            url.searchParams.append("showHidden", showHidden.toString());
        }

        await authenticatedAction(async () => {
            let data: CollectionsResponse;

            try {
                const response = await axios.get<CollectionsResponse>(decodeURIComponent(url.toString()), {
                    signal: newAbortSignal(),
                });

                data = response.data;
            } catch (error) {
                /* istanbul ignore next -- @preserve */
                if (isCancel(error)) {
                    return;
                }

                /* istanbul ignore next -- @preserve */
                throw error;
            }

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
        });
    };

    const searchNfts = async (showHidden: boolean, query?: string): Promise<void> => {
        setIsSearchingCollections(true);
        await fetchCollections(pageMeta.first_page_url, showHidden, query);
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
