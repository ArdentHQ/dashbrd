import cn from "classnames";
import { type MouseEventHandler, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/Components/Avatar";
import { DynamicBalance } from "@/Components/DynamicBalance";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { Skeleton } from "@/Components/Skeleton";
import { Tooltip } from "@/Components/Tooltip";
import { useAuth } from "@/Contexts/AuthContext";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { useLikes } from "@/Hooks/useLikes";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

interface NftImageProperties {
    nft: App.Data.Gallery.GalleryNftData;
    isSelected?: boolean;
    allowSelection?: boolean;
    className?: string;
}

interface NftImageContainerProperties {
    nft: App.Data.Gallery.GalleryNftData;
    onClick?: (nft: App.Data.Gallery.GalleryNftData) => void;
    allowSelection?: boolean;
    isSelected?: boolean;
    isAdded?: boolean;
    validateImage?: boolean;
}

interface NftImageGridProperties {
    className?: string;
    minimumToShow?: number;
    nfts: App.Data.Gallery.GalleryNftsData | App.Data.Gallery.GalleryNftData[];
    skeletonCount?: number;
    allowSelection?: boolean;
    onSelectNft?: (nft: App.Data.Gallery.GalleryNftData) => void;
    onDeselectNft?: (nft: App.Data.Gallery.GalleryNftData) => void;
    selectedNfts?: App.Data.Gallery.GalleryNftData[];
    addedNfts?: App.Data.Gallery.GalleryNftData[];
    validateImage?: boolean;
}

const NftImage = ({
    nft,
    isSelected = false,
    allowSelection = false,
    className = "",
}: NftImageProperties): JSX.Element => (
    <div
        data-testid={`NftImageGrid__element--${nft.tokenNumber}`}
        className="group"
    >
        <Img
            wrapperClassName="aspect-square h-full w-full"
            className={cn("rounded-xl", className)}
            src={nft.images.small ?? undefined}
            data-testid={`NftImageGrid__image--${nft.tokenNumber}`}
        />

        {allowSelection && (
            <div
                data-testid={`NftImageGrid__selected--${nft.tokenNumber}`}
                className={cn("transition-default pointer-events-none absolute inset-0 rounded-xl", {
                    "border-2 border-theme-primary-600 dark:border-theme-primary-400": isSelected,
                    "border-theme-primary-100 group-hover:border-3": !isSelected,
                })}
            >
                <div
                    className={cn(
                        "absolute inset-0 m-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/30 p-1 backdrop-blur-md dark:bg-theme-dark-900/30 dark:backdrop-blur-md",
                        {
                            "opacity-0": !isSelected,
                        },
                    )}
                >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-primary-600 text-white dark:bg-theme-primary-400">
                        <Icon name="CheckSmall" />
                    </div>
                </div>
            </div>
        )}
    </div>
);

const NftImageContainer = ({
    nft,
    onClick,
    allowSelection,
    isSelected,
    isAdded,
    validateImage,
}: NftImageContainerProperties): JSX.Element => {
    const { t } = useTranslation();

    if (isTruthy(isAdded)) {
        return (
            <div
                data-testid={`NftImageGrid__container--${nft.tokenNumber}--disabled`}
                className="relative overflow-hidden rounded-xl"
            >
                <Tooltip content={t("pages.galleries.create.already_selected_nft")}>
                    <div>
                        <NftImage
                            nft={nft}
                            className="blur-sm grayscale"
                        />
                    </div>
                </Tooltip>
            </div>
        );
    }

    if (Boolean(validateImage) && !isTruthy(nft.images.large)) {
        return (
            <div
                data-testid={`NftImageGrid__container--${nft.tokenNumber}--invalid_image`}
                className="relative overflow-hidden rounded-xl"
            >
                <Tooltip content={t("pages.galleries.create.nft_missing_image")}>
                    <div>
                        <NftImage nft={nft} />
                    </div>
                </Tooltip>
            </div>
        );
    }

    return (
        <div
            data-testid={`NftImageGrid__container--${nft.tokenNumber}`}
            className="relative overflow-hidden rounded-xl"
            onClick={() => {
                onClick?.(nft);
            }}
        >
            <NftImage
                nft={nft}
                isSelected={isSelected}
                allowSelection={allowSelection}
            />
        </div>
    );
};

export const NftImageGrid = ({
    className = "mb-3 grid aspect-[3/2] grid-cols-3 gap-1",
    minimumToShow = 6,
    nfts,
    skeletonCount,
    allowSelection,
    selectedNfts,
    addedNfts,
    onSelectNft,
    onDeselectNft,
    validateImage,
}: NftImageGridProperties): JSX.Element => {
    const nftData = "paginated" in nfts ? nfts.paginated.data : nfts;

    return (
        <div
            className={className}
            data-testid="NftImageGrid"
        >
            {nftData.map((nft, index) => {
                const isSelected = selectedNfts?.some((selectedNft) => selectedNft.tokenNumber === nft.tokenNumber);
                const isAdded = addedNfts?.some((addedNft) => addedNft.tokenNumber === nft.tokenNumber);

                return (
                    <NftImageContainer
                        key={index}
                        nft={nft}
                        allowSelection={allowSelection}
                        onClick={(nft) => {
                            if (isTruthy(isSelected)) {
                                return onDeselectNft?.(nft);
                            }

                            onSelectNft?.(nft);
                        }}
                        isSelected={isSelected}
                        isAdded={isAdded}
                        validateImage={validateImage}
                    />
                );
            })}

            {Array.from({ length: minimumToShow - nftData.length })
                .fill(0)
                .map((_, index) => (
                    <div
                        key={index}
                        className="aspect-square w-full rounded-xl bg-theme-secondary-100 dark:bg-theme-dark-800"
                        data-testid={`NftImageGrid__placeholder--${index}`}
                    />
                ))}

            {Array.from({ length: skeletonCount ?? 0 }).map((_, index) => (
                <Skeleton
                    className="NFT_Skeleton aspect-square w-full rounded-xl"
                    key={index}
                />
            ))}
        </div>
    );
};

export const GalleryHeading = ({ name, wallet }: { name: string; wallet: App.Data.SimpleWalletData }): JSX.Element => {
    const truncateReference = useRef<HTMLHeadingElement>(null);

    const isTruncated = useIsTruncated({ reference: truncateReference });

    return (
        <div>
            <div className="flex text-sm font-medium text-theme-secondary-700">
                <div className="flex shrink-0 items-center pr-2">
                    <Avatar
                        address={wallet.address}
                        avatar={wallet.avatar}
                        size={16}
                    />
                </div>

                <span
                    className="flex overflow-auto text-xs font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 sm:text-sm"
                    data-testid="GalleryHeading__address"
                >
                    {wallet.domain !== null ? (
                        <span
                            data-testid="UserDetails__domain"
                            className="max-w-full truncate"
                        >
                            {wallet.domain}
                        </span>
                    ) : (
                        <TruncateMiddle
                            length={10}
                            text={formatAddress(wallet.address)}
                        />
                    )}
                </span>
            </div>
            <Tooltip
                disabled={!isTruncated}
                content={name}
                delay={[500, 0]}
            >
                <Heading
                    className="transition-default truncate pt-0.5 group-hover:text-theme-primary-700 dark:group-hover:text-theme-primary-400"
                    level={4}
                    ref={truncateReference}
                >
                    {name}
                </Heading>
            </Tooltip>
        </div>
    );
};

const GalleryStatsLikeButton = ({ gallery }: { gallery: App.Data.Gallery.GalleryData }): JSX.Element => {
    const { likes, hasLiked, like } = useLikes({ count: gallery.likes, hasLiked: gallery.hasLiked });

    const { signedAction } = useAuthorizedAction();

    const likeButtonHandler: MouseEventHandler<HTMLElement> = (event): void => {
        event.preventDefault();
        event.stopPropagation();

        void signedAction(async ({ authenticated }) => {
            // If user wasnt authenticated, foce a positive
            // like since we dont know if he liked it before
            const likeValue = !authenticated ? true : undefined;

            await like(gallery.slug, likeValue);
        });
    };

    return (
        <div className="flex items-center space-x-2">
            <button
                type="button"
                onClick={likeButtonHandler}
                data-testid="GalleryStats__like-button"
            >
                <Icon
                    className={cn("transition-default", {
                        "fill-theme-danger-100 text-theme-danger-400 dark:fill-theme-dark-800": hasLiked,
                        "hover:fill-theme-danger-100 hover:text-theme-danger-400 dark:fill-theme-dark-800": !hasLiked,
                    })}
                    name="Heart"
                    size="lg"
                />
            </button>

            <span
                className="text-sm"
                data-testid="GalleryStats__likes"
            >
                {likes}
            </span>
        </div>
    );
};

export const GalleryFooter = ({ gallery }: { gallery: App.Data.Gallery.GalleryData }): JSX.Element => (
    <div
        className="flex items-center justify-between text-theme-secondary-700 dark:text-theme-dark-200"
        data-testid="GalleryFooter"
    >
        <GalleryStatsLikeButton gallery={gallery} />

        <div className="flex items-center space-x-2">
            <Icon
                name="Eye"
                size="lg"
            />
            <span
                className="text-sm"
                data-testid="GalleryStats__views"
            >
                {gallery.views}
            </span>
        </div>
    </div>
);

export const GalleryStats = ({
    gallery,
    footer = <GalleryFooter gallery={gallery} />,
}: {
    gallery: App.Data.Gallery.GalleryData;
    footer?: JSX.Element;
}): JSX.Element => {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <div
            className="rounded-b-xl bg-theme-secondary-50 px-6 pb-3 font-medium dark:bg-theme-dark-800"
            data-testid="GalleryStats"
        >
            <div className="flex justify-between pt-3">
                <div className="flex flex-col">
                    <span className="pb-0.5 text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                        {t("pages.galleries.value")}
                    </span>
                    <span
                        data-testid="GalleryStats__value"
                        className="text-sm dark:text-theme-dark-50 sm:text-base"
                    >
                        {gallery.value !== null ? (
                            <DynamicBalance
                                balance={gallery.value.toString()}
                                currency={user?.attributes.currency ?? "USD"}
                            />
                        ) : (
                            "-"
                        )}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="pb-0.5 text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                        {t("pages.galleries.nfts")}
                    </span>
                    <span className="text-sm dark:text-theme-dark-50 sm:text-base">{gallery.nftsCount}</span>
                </div>
                <div className="flex flex-col">
                    <span className="pb-0.5 text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                        {t("pages.galleries.collections")}
                    </span>
                    <span className="text-sm dark:text-theme-dark-50 sm:text-base">{gallery.collectionsCount}</span>
                </div>
            </div>
            <hr className="my-3 text-theme-secondary-300 dark:text-theme-dark-700" />
            {footer}
        </div>
    );
};

export const GalleryStatsPlaceholder = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="rounded-b-xl bg-theme-secondary-50 px-6 pb-3 font-medium text-theme-secondary-500 dark:bg-theme-dark-800/50 dark:text-theme-dark-400"
            data-testid="GalleryStatsPlaceholder"
        >
            <div className="flex space-x-8 pt-3">
                <div className="flex flex-col">
                    <span className="pb-0.5 text-sm leading-5.5 dark:text-theme-dark-400">
                        {t("pages.galleries.value")}
                    </span>
                    <span className="text-sm sm:text-base">$X.XX</span>
                </div>
                <div className="flex flex-col">
                    <span className="pb-0.5 text-sm leading-5.5 dark:text-theme-dark-400">
                        {t("pages.galleries.nfts")}
                    </span>
                    <span className="text-sm sm:text-base">XX</span>
                </div>
                <div className="flex flex-col">
                    <span className="pb-0.5 text-sm leading-5.5 dark:text-theme-dark-400">
                        {t("pages.galleries.collections")}
                    </span>
                    <span className="text-sm sm:text-base">X</span>
                </div>
            </div>
            <hr className="my-3 text-theme-secondary-300 dark:text-theme-dark-700" />
            <div className="flex items-center justify-between dark:text-theme-dark-200">
                <div className="flex items-center space-x-2">
                    <Icon
                        name="Heart"
                        size="lg"
                        className="dark:text-theme-dark-400"
                    />
                    <span
                        className="text-sm dark:text-theme-dark-400"
                        data-testid="GalleryStats__likes"
                    >
                        100
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <Icon
                        name="Eye"
                        size="lg"
                        className="dark:text-theme-dark-400"
                    />
                    <span
                        className="text-sm dark:text-theme-dark-400"
                        data-testid="GalleryStats__views"
                    >
                        100
                    </span>
                </div>
            </div>
        </div>
    );
};

export const GalleryHeadingPlaceholder = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div data-testid="GalleryHeadingPlaceholder">
            <div className="flex text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-400">
                <div className="flex items-center pr-2">
                    <div className="h-4 w-4 rounded-full bg-theme-secondary-300 dark:bg-theme-dark-800"></div>
                </div>

                <span
                    className="flex overflow-auto text-xs font-medium leading-5.5 text-theme-secondary-500 dark:text-theme-dark-400 sm:text-sm"
                    data-testid="GalleryHeading__address"
                >
                    <TruncateMiddle
                        length={10}
                        text="0xXXXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                </span>
            </div>
            <span className="line-clamp-1 pt-0.5">
                <Heading level={4}>
                    <span className="text-theme-secondary-500 dark:text-theme-dark-400">
                        {t("common.gallery_name")}
                    </span>
                </Heading>
            </span>
        </div>
    );
};
