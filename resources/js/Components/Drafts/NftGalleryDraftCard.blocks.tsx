import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/Components/Avatar";
import { DynamicBalance } from "@/Components/DynamicBalance";
import DeleteGalleryButton from "@/Components/Galleries/DeleteGalleryButton";
import { Heading } from "@/Components/Heading";
import { Icon } from "@/Components/Icon";
import { Img } from "@/Components/Image";
import { Skeleton } from "@/Components/Skeleton";
import { Tooltip } from "@/Components/Tooltip";
import { useAuth } from "@/Contexts/AuthContext";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { type DraftNft, type GalleryDraft } from "@/Pages/Galleries/hooks/useGalleryDrafts";
import { formatAddress } from "@/Utils/format-address";
import { isTruthy } from "@/Utils/is-truthy";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

export const NftGalleryDraftFooter = ({ onDelete }: { onDelete: () => void }): JSX.Element => {
    const { t } = useTranslation();

    const deleteHandler: React.MouseEventHandler<HTMLButtonElement> = (event): void => {
        event.preventDefault();

        onDelete();
    };

    return (
        <div
            className="-my-1.5 flex items-center justify-between text-theme-secondary-700 dark:text-theme-dark-200"
            data-testid="NftGalleryDraftCard__Footer"
        >
            <div className="flex items-center space-x-2">
                <Icon
                    name="Document"
                    size="lg"
                    className="dark:text-theme-dark-300"
                />
                <span className="text-sm text-theme-secondary-700 dark:text-theme-dark-200">{t("common.draft")}</span>
            </div>

            <Tooltip content={t("common.delete_draft")}>
                <div>
                    <DeleteGalleryButton onDelete={deleteHandler} />
                </div>
            </Tooltip>
        </div>
    );
};

export const NftGalleryDraftHeading = ({
    walletAddress,
    title,
}: {
    walletAddress?: string;
    title: string;
}): JSX.Element => {
    const truncateReference = useRef<HTMLHeadingElement>(null);

    const isTruncated = useIsTruncated({ reference: truncateReference });

    return (
        <div data-testid="NftGalleryDraftHeading">
            {isTruthy(walletAddress) && (
                <div
                    className="flex text-sm font-medium text-theme-secondary-700"
                    data-testid="NftGalleryDraftHeading__address"
                >
                    <div className="flex shrink-0 items-center pr-2">
                        <Avatar
                            address={walletAddress}
                            size={16}
                        />
                    </div>

                    <span
                        className="flex overflow-auto text-xs font-medium leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 sm:text-sm"
                        data-testid="GalleryHeading__address"
                    >
                        <TruncateMiddle
                            length={10}
                            text={formatAddress(walletAddress)}
                        />
                    </span>
                </div>
            )}
            <Tooltip
                disabled={!isTruncated}
                content={title}
                delay={[500, 0]}
            >
                <Heading
                    className="transition-default min-h-[1.875rem] truncate pt-0.5 group-hover:text-theme-primary-700 dark:group-hover:text-theme-primary-400"
                    level={4}
                    ref={truncateReference}
                >
                    {title}
                </Heading>
            </Tooltip>
        </div>
    );
};

export const NftGalleryDraftStats = ({
    draft,
    onDelete,
}: {
    draft: GalleryDraft;
    onDelete: () => void;
}): JSX.Element => {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <div
            className="rounded-b-xl bg-theme-secondary-50 px-6 pb-3 font-medium dark:bg-theme-dark-800"
            data-testid="NftGalleryDraftStats"
        >
            <div className="flex justify-between pt-3">
                <div className="flex flex-col">
                    <span className="pb-0.5 text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                        {t("pages.galleries.value")}
                    </span>
                    <span
                        data-testid="NftGalleryDraftStats__value"
                        className="text-sm dark:text-theme-dark-50 sm:text-base"
                    >
                        {isTruthy(draft.value) ? (
                            <DynamicBalance
                                balance={draft.value.toString()}
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
                    <span
                        className="text-sm dark:text-theme-dark-50 sm:text-base"
                        data-testid="NftGalleryDraftStats__nftCount"
                    >
                        {draft.nfts.length}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="pb-0.5 text-sm leading-5.5 text-theme-secondary-500 dark:text-theme-dark-300">
                        {t("pages.galleries.collections")}
                    </span>
                    <span
                        className="text-sm dark:text-theme-dark-50 sm:text-base"
                        data-testid="NftGalleryDraftStats__collectionsCount"
                    >
                        {draft.collectionsCount}
                    </span>
                </div>
            </div>
            <hr className="my-3 text-theme-secondary-300 dark:text-theme-dark-700" />
            <NftGalleryDraftFooter onDelete={onDelete} />
        </div>
    );
};

export const NftGalleryDraftImageContainer = ({ nft }: { nft: DraftNft }): JSX.Element => (
    <div
        data-testid={`NftGalleryDraftImageGrid__container--${nft.nftId}`}
        className="group relative overflow-hidden rounded-xl"
    >
        <Img
            wrapperClassName="aspect-square h-full w-full"
            className="rounded-xl"
            src={nft.image}
            data-testid={`NftGalleryDraftImageGrid__image--${nft.nftId}`}
        />
    </div>
);

export const NftGalleryDraftImageGrid = ({
    nfts,
    minimumToShow = 6,
    skeletonCount,
}: {
    nfts: GalleryDraft["nfts"];
    minimumToShow?: number;
    skeletonCount?: number;
}): JSX.Element => {
    const nftData = nfts.slice(0, minimumToShow);

    return (
        <div
            data-testid="NftGalleryDraftImageGrid"
            className="mb-3 grid aspect-[3/2] grid-cols-3 gap-1"
        >
            {nftData.map((nft, index) => (
                <NftGalleryDraftImageContainer
                    key={index}
                    nft={nft}
                />
            ))}

            {Array.from({ length: minimumToShow - nftData.length })
                .fill(0)
                .map((_, index) => (
                    <div
                        key={index}
                        className="aspect-square w-full rounded-xl bg-theme-secondary-100 dark:bg-theme-dark-800"
                        data-testid={`NftGalleryDraftImageGrid__placeholder--${index}`}
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
