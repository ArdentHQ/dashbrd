import { Head, usePage } from "@inertiajs/react";
import { NftBackButton } from "@/Components/Collections/Nfts/NftBackButton";
import { ExternalLinkContextProvider } from "@/Contexts/ExternalLinkContext";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { NftHeading } from "@/Pages/Collections/Nfts/Components/NftHeading";

interface Properties {
    title: string;
    nft: App.Data.Nfts.NftData;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    activities: App.Data.Nfts.NftActivitiesData;
    collectionDetails: App.Data.Collections.CollectionBasicDetailsData;
    traits: App.Data.Collections.CollectionTraitData[];
    nativeToken: App.Data.Token.TokenData;
    showReportModal: boolean;
}

const CollectionsNftsView = ({
    title,
    nft,
    reportAvailableIn,
    alreadyReported = false,
    activities,
    collectionDetails,
    traits,
    nativeToken,
    showReportModal,
}: Properties): JSX.Element => {
    const { props } = usePage();

    return (
        <ExternalLinkContextProvider allowedExternalDomains={props.allowedExternalDomains}>
            <DefaultLayout toastMessage={props.toast}>
                <Head title={title} />

                <NftBackButton
                    nft={nft}
                    url={route("collections.view", {
                        slug: nft.collection.slug,
                    })}
                    className="-mt-6 mb-6 bg-theme-secondary-50 px-6 py-4 dark:bg-theme-dark-950 sm:-mt-8 sm:mb-8 lg:-mt-4 lg:mb-0 lg:bg-white lg:px-8 dark:lg:bg-theme-dark-900 2xl:px-0"
                />

                <NftHeading
                    nft={nft}
                    activities={activities}
                    nativeToken={nativeToken}
                    collectionDetails={collectionDetails}
                    alreadyReported={alreadyReported}
                    reportAvailableIn={reportAvailableIn}
                    reportReasons={props.reportReasons}
                    traits={traits}
                    showReportModal={showReportModal}
                />
            </DefaultLayout>
        </ExternalLinkContextProvider>
    );
};

export default CollectionsNftsView;
