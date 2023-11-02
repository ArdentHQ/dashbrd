import groupBy from "lodash/groupBy";
import React from "react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionItem } from "@/Components/Accordion";
import { Button } from "@/Components/Buttons";
import { useEditableGalleryContext } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { useNftSelectableContext } from "@/Components/Galleries/Hooks/useNftSelectableContext";
import { NftImageGrid } from "@/Components/Galleries/NftGalleryCard.blocks";
import { Img } from "@/Components/Image";
import { Skeleton } from "@/Components/Skeleton";
import { tp } from "@/Utils/TranslatePlural";

interface NftCollectionsProperties {
    nfts: App.Data.Gallery.GalleryNftData[];
    allNftsLoaded: (nft: App.Data.Gallery.GalleryNftData) => boolean;
    loadMoreNfts: (nft: App.Data.Gallery.GalleryNftData) => void;
    skeletonCount?: number;
    getLoadingNftsCount: (nft: App.Data.Gallery.GalleryNftData) => number;
}

export const NftItemTitle = ({ nft }: { nft: App.Data.Gallery.GalleryNftData }): JSX.Element => (
    <div className="flex items-center justify-between space-x-2">
        <div className="flex min-w-0 flex-1 items-center space-x-3">
            {nft.collectionImage !== null && (
                <Img
                    src={nft.collectionImage}
                    wrapperClassName="h-8 w-8 rounded-full overflow-hidden"
                    errorClassName="px-1 py-1"
                />
            )}

            <div className="truncate font-medium dark:text-theme-dark-50">{nft.collectionName}</div>
        </div>

        <div className="whitespace-nowrap text-sm font-medium text-theme-secondary-700 dark:text-theme-dark-200">
            {tp("common.nft_count", nft.collectionNftCount, { count: nft.collectionNftCount })}
        </div>
    </div>
);

export const NftItemLoadMoreButton = ({ onClick }: { onClick: () => void }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="mt-5">
            <Button
                data-testid="NftCollectionSlider__loadMoreNfts"
                variant="secondary"
                className="inline-flex w-full flex-1 justify-center sm:flex-none"
                onClick={onClick}
            >
                {t("pages.galleries.create.load_more_nfts")}
            </Button>
        </div>
    );
};

const NftCollectionLoadingSkeleton = (): JSX.Element => (
    <div
        className="flex"
        data-testid="Collection_Skeleton"
    >
        <div className="flex min-w-0 flex-1 items-center space-x-3">
            <Skeleton
                isCircle
                className="relative h-8 w-8 shrink-0"
            />

            <Skeleton className="h-4 w-20 sm:w-36" />
        </div>
        <Skeleton className="h-4 w-20" />
    </div>
);

export const NftCollections = ({
    nfts,
    allNftsLoaded,
    loadMoreNfts,
    skeletonCount,
    getLoadingNftsCount,
}: NftCollectionsProperties): JSX.Element => {
    const { selected, addToSelection, removeFromSelection } = useNftSelectableContext();
    const { nfts: addedNfts } = useEditableGalleryContext();

    const items = Object.entries(
        groupBy(nfts, (nft: App.Data.Gallery.GalleryNftData) => `${nft.chainId}-${nft.tokenAddress}`),
    );

    return (
        <div data-testid="NftCollections">
            <Accordion>
                {items.map(([key, nfts]) => (
                    <AccordionItem
                        key={`Accordion__item-${key}`}
                        title={
                            <NftItemTitle
                                key={key}
                                nft={nfts[0]}
                            />
                        }
                    >
                        <>
                            <NftImageGrid
                                className="grid grid-cols-2 gap-1 sm:grid-cols-4"
                                nfts={nfts}
                                minimumToShow={1}
                                skeletonCount={getLoadingNftsCount(nfts[0])}
                                allowSelection
                                addedNfts={addedNfts.selected}
                                selectedNfts={selected}
                                onDeselectNft={removeFromSelection}
                                onSelectNft={addToSelection}
                                validateImage={true}
                            />

                            {!allNftsLoaded(nfts[0]) && (
                                <NftItemLoadMoreButton
                                    onClick={() => {
                                        loadMoreNfts(nfts[0]);
                                    }}
                                />
                            )}
                        </>
                    </AccordionItem>
                ))}

                {Array.from({ length: skeletonCount ?? 0 }).map((_, key) => (
                    <AccordionItem
                        key={`HeadOnly_Accordion__item-${key}`}
                        title={<NftCollectionLoadingSkeleton />}
                    />
                ))}
            </Accordion>
        </div>
    );
};
