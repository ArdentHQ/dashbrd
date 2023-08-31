import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CollectionActivityTable } from "@/Components/Collections/CollectionActivityTable";
import { NftHeader } from "@/Components/Collections/Nfts/NftHeader";
import { NftImage } from "@/Components/Collections/Nfts/NftImage";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { NftTab } from "@/Pages/Collections/Nfts/Components/NftTab";
import { TraitsCarousel } from "@/Pages/Collections/Nfts/Components/TraitsCarousel";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    nft: App.Data.Nfts.NftData;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    reportReasons?: Record<string, string>;
    activities: App.Data.Nfts.NftActivitiesData;
    collectionDetails: App.Data.Collections.CollectionBasicDetailsData;
    traits?: App.Data.Collections.CollectionTraitData[];
    nativeToken: App.Data.Token.TokenData;
}

export type NftTabTypes = "trait" | "activity";

const INITIAL_ACTIVITY_FETCH_INTERVAL = 5000;

export const NftHeading = ({
    nft,
    alreadyReported = false,
    reportAvailableIn = null,
    reportReasons,
    activities,
    collectionDetails,
    traits = [],
    nativeToken,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { isLgAndAbove } = useBreakpoint();

    const [pageLimit, setPageLimit] = useState<number>(activities.paginated.meta.per_page);
    const [selectedTab, setSelectedTab] = useState<NftTabTypes>(
        () => (new URLSearchParams(window.location.search).get("tab") ?? "trait") as NftTabTypes,
    );
    const [dirtyState, setDirtyState] = useState<boolean>(false);

    const pageLimitChangeHandler = (pageLimit: number): void => {
        setPageLimit(pageLimit);
        setDirtyState(true);
    };

    const tabChangeHandler = (tab: NftTabTypes): void => {
        setSelectedTab(tab);
        setDirtyState(true);
    };

    const reloadPage = (): void => {
        router.get(
            route("collection-nfts.view", {
                collection: collectionDetails.slug,
                nft: nft.tokenNumber,
            }),
            {
                pageLimit,
                tab: selectedTab,
            },
            {
                preserveScroll: true,
                preserveState: true,
                queryStringArrayFormat: "indices",
                replace: true,
            },
        );
    };

    useEffect(() => {
        if (!dirtyState) {
            return;
        }

        reloadPage();
    }, [pageLimit, dirtyState]);

    useEffect(() => {
        const reloadTimer = setInterval(() => {
            if (!isTruthy(nft.lastActivityFetchedAt)) {
                reloadPage();
            }
        }, INITIAL_ACTIVITY_FETCH_INTERVAL);

        return () => {
            clearInterval(reloadTimer);
        };
    }, [nft]);

    const ActivitiesTable = (): JSX.Element => {
        if (!isTruthy(nft.lastActivityFetchedAt)) {
            return <EmptyBlock>{t("pages.collections.activities.loading_activities")}</EmptyBlock>;
        }

        if (activities.paginated.data.length === 0) {
            return <EmptyBlock>{t("pages.collections.activities.no_activity")}</EmptyBlock>;
        }

        return (
            <CollectionActivityTable
                collection={collectionDetails}
                activities={activities}
                nativeToken={nativeToken}
                pageLimit={pageLimit}
                onPageLimitChange={pageLimitChangeHandler}
            />
        );
    };

    return (
        <div className="mx-auto -mt-6 flex w-full max-w-content flex-1 flex-col sm:-mt-8 md:px-8 lg:-mt-0 2xl:px-0">
            <div className="flex min-w-0 items-center justify-center gap-6 border border-theme-secondary-300 bg-gradient-to-r from-theme-secondary-100 from-[-20.9%] via-theme-secondary-200 via-[57.77%] to-theme-danger-100 to-[131.63%] md:p-6 lg:mb-6 lg:rounded-xl">
                <NftImage
                    nft={nft}
                    alreadyReported={alreadyReported}
                    reportAvailableIn={reportAvailableIn}
                    reportReasons={reportReasons}
                />

                <div className="hidden min-w-0 flex-1 lg:block">
                    <div className="border-b border-dashed border-theme-secondary-400 pb-6 pt-5">
                        <NftHeader nft={nft} />
                    </div>

                    <div className="relative mb-3 mt-6">
                        <TraitsCarousel traits={traits} />
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-col items-center border-b border-theme-secondary-300 px-8 pb-6 pt-4 lg:hidden">
                <NftHeader nft={nft} />
            </div>
            <div className="hidden lg:block">
                <ActivitiesTable />
            </div>

            {!isLgAndAbove && (
                <NftTab
                    traits={traits}
                    selectedTab={selectedTab}
                    onTabChange={tabChangeHandler}
                    ActivitiesTable={ActivitiesTable}
                />
            )}
        </div>
    );
};
