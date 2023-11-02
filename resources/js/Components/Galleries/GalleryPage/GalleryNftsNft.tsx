import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { GalleryCard } from "@/Components/Galleries/GalleryPage/GalleryCard";
import { Icon } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { Link } from "@/Components/Link";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { FormatCrypto } from "@/Utils/Currency";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    nft: App.Data.Gallery.GalleryNftData;
    isSelected: boolean;
    onClick: (nft?: string) => void;
}

export const GalleryNftsNft = ({ nft, isSelected, onClick }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const nftNameReference = useRef<HTMLDivElement>(null);

    const isTruncated = useIsTruncated({ reference: nftNameReference });

    const imageSource = useMemo<string | null>(
        () => [nft.images.large, nft.images.small, nft.images.thumb].find((image) => image !== null) ?? null,
        [nft.images],
    );

    const openSeaLink = useMemo<string>(
        () =>
            `https://opensea.io/assets/${nft.chainId === 137 ? "matic" : "ethereum"}/${nft.tokenAddress}/${
                nft.tokenNumber
            }`,
        [nft],
    );

    const blurLink = useMemo<string>(() => `https://blur.io/asset/${nft.tokenAddress}/${nft.tokenNumber}`, [nft]);

    const uniswapLink = useMemo<string>(
        () => `https://app.uniswap.org/#/nfts/asset/${nft.tokenAddress}/${nft.tokenNumber}`,
        [nft],
    );

    const hasNftName = isTruthy(nft.name);

    const handleClick = (): void => {
        onClick(isSelected ? undefined : `${nft.tokenNumber}_${nft.id}`);
    };

    return (
        <GalleryCard
            isSelected={isSelected}
            onClick={handleClick}
        >
            <GalleryCard.Overlay>
                {isSelected && (
                    <div className="absolute right-3 top-3 lg:hidden">
                        <div className="flex items-center justify-center rounded-full bg-white/30 p-1 backdrop-blur-md">
                            <IconButton
                                data-testid="NftGalleryCardEditable__add"
                                icon="X"
                                className="h-8 w-8 border-white outline-offset-4"
                                onClick={handleClick}
                            />
                        </div>
                    </div>
                )}

                <div className="flex max-w-full flex-col items-center justify-center overflow-auto font-medium">
                    {nft.collectionImage !== null && (
                        <div
                            className="pb-2"
                            data-testid="GalleryNftsNft__collection_image"
                        >
                            <Img
                                wrapperClassName="h-15 w-15 aspect-square"
                                src={nft.collectionImage}
                                className="rounded-full"
                            />
                        </div>
                    )}
                    <Link
                        href={route("collections.view", {
                            slug: nft.collectionSlug,
                        })}
                        className="outline-offset-3 transition-default mx-auto flex max-w-full items-center overflow-hidden truncate rounded-full px-2 text-theme-primary-600 underline decoration-transparent underline-offset-2 outline-none outline-3 hover:text-theme-primary-700 hover:decoration-theme-primary-700 focus-visible:outline-theme-primary-300 dark:text-theme-primary-400 dark:hover:text-theme-primary-600 dark:hover:decoration-theme-primary-600"
                        data-testid="GalleryNftsNft__website"
                    >
                        <span className="truncate">{nft.collectionName}</span>
                    </Link>

                    <Tooltip
                        disabled={!isTruncated}
                        content={hasNftName ? nft.name : nft.tokenNumber}
                        delay={[500, 0]}
                        zIndex={10}
                    >
                        <div className="mt-0.5 flex max-w-full items-center space-x-1.5 text-2xl text-theme-secondary-900 dark:text-theme-dark-50">
                            {hasNftName && (
                                <span
                                    className="block truncate"
                                    ref={nftNameReference}
                                    data-testid="GalleryNftsNft__name"
                                >
                                    {nft.name}
                                </span>
                            )}

                            {!hasNftName && (
                                <span
                                    ref={nftNameReference}
                                    className="block truncate"
                                    data-testid="GalleryNftsNft__tokenNumber"
                                >
                                    {nft.tokenNumber}
                                </span>
                            )}
                        </div>
                    </Tooltip>

                    <div className="mx-auto mt-8 flex space-x-2 text-sm">
                        <span className="truncate text-theme-secondary-700 dark:text-theme-dark-200">
                            {t("pages.galleries.floor_price")}:
                        </span>
                        <span
                            data-testid="GalleryNftsNft__price"
                            className="whitespace-nowrap text-theme-secondary-900 dark:text-theme-dark-50"
                        >
                            <FormatCrypto
                                value={nft.floorPrice ?? "0"}
                                token={{
                                    symbol: nft.floorPriceCurrency ?? "ETH",
                                    name: nft.floorPriceCurrency ?? "ETH",
                                    decimals: nft.floorPriceDecimals ?? 18,
                                }}
                            />
                        </span>
                    </div>

                    <div className="mx-auto mt-3 flex space-x-2 rounded-full bg-white/30 p-1 backdrop-blur-0">
                        <Link
                            external
                            href={openSeaLink}
                            className="button-icon border-0 dark:bg-theme-dark-900"
                            data-testid="GalleryNftsNft__socials-opensea"
                            showExternalIcon={false}
                        >
                            <Icon name="Opensea" />
                        </Link>

                        <Link
                            external
                            href={blurLink}
                            data-testid="GalleryNftsNft__socials-blur"
                            className="button-icon border-0 dark:bg-theme-dark-900"
                            showExternalIcon={false}
                        >
                            <Icon name="Blur" />
                        </Link>

                        <Link
                            external
                            href={uniswapLink}
                            className="button-icon border-0 dark:bg-theme-dark-900"
                            data-testid="GalleryNftsNft__socials-uniswap"
                            showExternalIcon={false}
                        >
                            <Icon name="Uniswap" />
                        </Link>
                    </div>
                </div>
            </GalleryCard.Overlay>

            {imageSource !== null && (
                <Img
                    errorMessage={t("common.unable_to_retrieve_image")}
                    data-testid="GalleryNftsNft__image"
                    wrapperClassName="aspect-square"
                    src={imageSource}
                />
            )}
        </GalleryCard>
    );
};
