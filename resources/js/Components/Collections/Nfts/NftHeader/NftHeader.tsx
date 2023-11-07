import cn from "classnames";
import { useTranslation } from "react-i18next";

import { CollectionDescription } from "@/Components/Collections/CollectionDescription";
import { NftActions } from "@/Components/Collections/Nfts/NftHeader/NftActions";
import { NftBasicInfo } from "@/Components/Collections/Nfts/NftHeader/NftBasicInfo";
import { NftOwner } from "@/Components/Collections/Nfts/NftHeader/NftOwner";
import { Marketplaces } from "@/Components/Marketplaces";
import { Point } from "@/Components/Point";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    nft: App.Data.Nfts.NftData;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
    showReportModal?: boolean;
}

export const NftHeader = ({
    nft,
    alreadyReported,
    reportAvailableIn,
    reportReasons,
    showReportModal = false,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { isLgAndAbove } = useBreakpoint();

    if (isLgAndAbove) {
        return (
            <div
                className="flex w-full justify-between"
                data-testid="NftHeader__desktop"
            >
                <div className="flex w-full flex-col gap-2">
                    <NftBasicInfo nft={nft} />
                    <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                        <NftOwner nft={nft} />
                        <div className="hidden xl:block">
                            <Point className="dark:bg-theme-secondary-400" />
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <CollectionDescription
                                name={t("pages.nfts.about_nft")}
                                description={nft.description}
                                linkClassName="font-medium text-sm"
                            />

                            {isTruthy(nft.collection.openSeaSlug) && (
                                <div className="flex flex-row items-center gap-2">
                                    <Point className="dark:bg-theme-secondary-400" />
                                    <Marketplaces
                                        type="nft"
                                        nftId={nft.tokenNumber}
                                        address={nft.collection.address}
                                        chainId={nft.collection.chainId}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-end">
                    <NftActions
                        alreadyReported={alreadyReported}
                        className="justify-center"
                        nft={nft}
                        reportAvailableIn={reportAvailableIn}
                        reportReasons={reportReasons}
                        showReportModal={showReportModal}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className="flex w-full flex-col items-center justify-center gap-2 border-b border-solid border-theme-secondary-300 bg-theme-secondary-50 px-7 pb-4 pt-4 backdrop-blur dark:border-theme-dark-700 dark:bg-theme-dark-950 sm:flex-row sm:border-none sm:pb-4 xs:px-8"
                data-testid="NftHeader__mobile"
            >
                <div className="flex flex-row items-center justify-center gap-2">
                    <NftOwner nft={nft} />

                    <Point className="dark:bg-theme-secondary-400" />

                    <CollectionDescription
                        name={t("pages.nfts.about_nft")}
                        description={nft.description}
                        linkClassName="font-medium text-sm"
                    />

                    <div
                        className={cn("hidden", {
                            "sm:block": isTruthy(nft.collection.openSeaSlug),
                        })}
                        data-testid="NftHeader__mobile__marketplaces_point"
                    >
                        <Point />
                    </div>
                </div>
                <div>
                    {isTruthy(nft.collection.openSeaSlug) && (
                        <Marketplaces
                            type="nft"
                            nftId={nft.tokenNumber}
                            address={nft.collection.address}
                            chainId={nft.collection.chainId}
                        />
                    )}
                </div>
            </div>

            <div className="mb-6 flex w-full flex-col gap-4 border-b border-solid border-theme-secondary-300 bg-white pb-6 pt-4 dark:border-theme-dark-700 dark:bg-theme-dark-900">
                <NftBasicInfo nft={nft} />
                <NftActions
                    alreadyReported={alreadyReported}
                    className="justify-center"
                    nft={nft}
                    reportAvailableIn={reportAvailableIn}
                    reportReasons={reportReasons}
                    showReportModal={showReportModal}
                />
            </div>
        </>
    );
};
