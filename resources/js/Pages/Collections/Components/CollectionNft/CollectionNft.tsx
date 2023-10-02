import { Link } from "@inertiajs/react";
import cn from "classnames";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Img } from "@/Components/Image";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { isTruthy } from "@/Utils/is-truthy";

export const CollectionNft = ({
    nft,
    owned,
}: {
    nft: App.Data.Gallery.GalleryNftData;
    owned: boolean;
}): JSX.Element => {
    const { t } = useTranslation();

    const nftTokenNumberReference = useRef<HTMLDivElement>(null);
    const nftNameReference = useRef<HTMLDivElement>(null);

    const isTokenNumberTruncated = useIsTruncated({ reference: nftTokenNumberReference });
    const isNameTruncated = useIsTruncated({ reference: nftNameReference });

    return (
        <Link
            href={route("collection-nfts.view", {
                collection: nft.collectionSlug,
                nft: nft.tokenNumber,
            })}
            className="transition-default group cursor-pointer rounded-xl border border-theme-secondary-300 p-2 ring-theme-primary-100 hover:ring-2 dark:border-theme-dark-700 dark:ring-theme-dark-700"
        >
            <span className="relative block">
                <Img
                    className="block aspect-square h-full w-full grow rounded-lg bg-theme-secondary-100 object-cover dark:bg-theme-dark-900"
                    src={nft.images.small ?? undefined}
                />

                <span className="absolute inset-x-0 top-0 m-4 flex">
                    <span className="flex h-7.5 min-w-0 items-center rounded-3xl bg-theme-primary-50/50 p-1  dark:bg-theme-dark-950/70 dark:text-theme-dark-50">
                        <Tooltip
                            content={<span>#&nbsp;{nft.tokenNumber}</span>}
                            disabled={!isTokenNumberTruncated}
                        >
                            <span
                                ref={nftTokenNumberReference}
                                className={cn(
                                    "truncate text-sm font-medium text-theme-secondary-900 dark:text-theme-dark-50",
                                    {
                                        "mr-2": isTokenNumberTruncated,
                                    },
                                )}
                            >
                                <span className="px-2"># {nft.tokenNumber}</span>
                            </span>
                        </Tooltip>

                        {owned && (
                            <span className="flex h-5.5 items-center rounded-3xl bg-white px-2 text-xs font-medium text-theme-secondary-900 dark:bg-theme-dark-900 dark:text-theme-dark-50">
                                {t("pages.collections.owned")}
                            </span>
                        )}
                    </span>
                </span>
            </span>

            <span className="transition-default block overflow-auto p-4 font-medium text-theme-secondary-900 dark:text-theme-dark-50 dark:group-hover:text-theme-primary-400">
                <Tooltip
                    content={nft.name ?? ""}
                    disabled={!isNameTruncated || !isTruthy(nft.name)}
                >
                    <span
                        ref={nftNameReference}
                        className="block truncate"
                    >
                        {nft.name ?? nft.tokenNumber}
                    </span>
                </Tooltip>
            </span>
        </Link>
    );
};
