import { useTranslation } from "react-i18next";
import { CollectionDescription } from "@/Components/Collections/CollentionDescription";
import { NftActions } from "@/Components/Collections/Nfts/NftHeader/NftActions";
import { NftBasicInfo } from "@/Components/Collections/Nfts/NftHeader/NftBasicInfo";
import { NftOwner } from "@/Components/Collections/Nfts/NftHeader/NftOwner";
import { Point } from "@/Components/Point";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

interface Properties {
    nft: App.Data.Nfts.NftData;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
}

export const NftHeader = ({ nft, alreadyReported, reportAvailableIn, reportReasons }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { isLgAndAbove } = useBreakpoint();

    if (isLgAndAbove) {
        return (
            <div
                className="flex w-full justify-between"
                data-testId="NftHeader__desktop"
            >
                <div className="flex w-full flex-col gap-2">
                    <NftBasicInfo nft={nft} />
                    <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                        <NftOwner nft={nft} />
                        <div className="hidden xl:block">
                            <Point />
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <CollectionDescription
                                name={t("pages.nfts.about_nft")}
                                description={nft.collection.description}
                                linkClassName="font-medium text-sm"
                            />
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
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className="flex w-full flex-row items-center justify-center gap-2 border-b border-solid border-theme-secondary-300 bg-theme-secondary-50 px-8 pb-4 pt-4 backdrop-blur sm:border-none sm:pb-4"
                data-testId="NftHeader__mobile"
            >
                <NftOwner nft={nft} />

                <Point />

                <CollectionDescription
                    name={t("pages.nfts.about_nft")}
                    description={nft.collection.description}
                    linkClassName="font-medium text-sm"
                />
            </div>

            <div className="mb-6 flex w-full flex-col gap-4 border-b border-solid border-theme-secondary-300 bg-white pb-6 pt-4">
                <NftBasicInfo nft={nft} />
                <NftActions
                    alreadyReported={alreadyReported}
                    className="justify-center"
                    nft={nft}
                    reportAvailableIn={reportAvailableIn}
                    reportReasons={reportReasons}
                />
            </div>
        </>
    );
};
