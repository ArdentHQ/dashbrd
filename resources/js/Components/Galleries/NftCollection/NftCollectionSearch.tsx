import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons/Button";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { SearchInput } from "@/Components/Form/SearchInput";
import { useGalleryNftsContext } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import { useNftSelectableContext } from "@/Components/Galleries/Hooks/useNftSelectableContext";
import { NftCollections } from "@/Components/Galleries/NftCollection/NftCollections";
import { LoadingBlock } from "@/Components/LoadingBlock/LoadingBlock";
import { useDebounce } from "@/Hooks/useDebounce";

const debounceTimeout = 400;

export const NftCollectionSearch = (): JSX.Element => {
    const { t } = useTranslation();
    const { clearSelection } = useNftSelectableContext();
    const [searchQuery, setSearchQuery] = useState<string>("");

    const {
        remainingCollectionCount,
        loadMoreCollections,
        allNftsLoaded,
        loadMoreNfts,
        loadingCollections,
        getLoadingNftsCount,
        searchNfts,
        isSearchingCollections,
        nfts,
    } = useGalleryNftsContext();

    useEffect(
        () => () => {
            clearSelection();
            setSearchQuery("");
        },
        [],
    );

    const [debouncedQuery] = useDebounce(searchQuery, debounceTimeout);
    const remainingCollections = remainingCollectionCount();

    useEffect(() => {
        void searchNfts(debouncedQuery);
    }, [debouncedQuery]);

    return (
        <>
            <div className="flex-1 space-y-4">
                <SearchInput
                    placeholder={t("pages.galleries.search.placeholder_nfts")}
                    query={searchQuery}
                    onChange={setSearchQuery}
                />

                {isSearchingCollections && <LoadingBlock text={t("common.searching")} />}

                {nfts.length === 0 && !loadingCollections && (
                    <EmptyBlock
                        data-testid="NftCollectionSlider__noresults"
                        textClasses="text-sm"
                    >
                        {t("pages.galleries.create.no_results")}
                    </EmptyBlock>
                )}

                {!isSearchingCollections && nfts.length > 0 && (
                    <>
                        <NftCollections
                            nfts={nfts}
                            loadMoreNfts={loadMoreNfts}
                            allNftsLoaded={allNftsLoaded}
                            skeletonCount={loadingCollections ? remainingCollections : 0}
                            getLoadingNftsCount={getLoadingNftsCount}
                        />

                        {remainingCollections > 0 && (
                            <Button
                                data-testid="NftCollectionSlider__loadMoreCollections"
                                variant="secondary"
                                className="inline-flex w-full flex-1 justify-center sm:flex-none"
                                onClick={() => {
                                    loadMoreCollections(debouncedQuery);
                                }}
                            >
                                {t("pages.galleries.create.load_more_collections", {
                                    count: remainingCollections,
                                })}
                            </Button>
                        )}
                    </>
                )}
            </div>
        </>
    );
};
