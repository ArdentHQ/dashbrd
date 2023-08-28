import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { NftBackButton } from "@/Components/Collections/Nfts/NftBackButton";
import { ExternalLinkContextProvider } from "@/Contexts/ExternalLinkContext";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { NftHeading } from "@/Pages/Collections/Nfts/Components/NftHeading";
import { assertUser } from "@/Utils/assertions";

interface Properties {
    title: string;
    auth: PageProps["auth"];
    nft: App.Data.Nfts.NftData;
    alreadyReported?: boolean;
    reportAvailableIn?: string | null;
    activities: App.Data.Nfts.NftActivitiesData;
    collectionDetails: App.Data.Collections.CollectionBasicDetailsData;
    traits: App.Data.Collections.CollectionTraitData[];
    nativeToken: App.Data.Token.TokenData;
}

const CollectionsNftsView = ({
    auth,
    title,
    nft,
    reportAvailableIn,
    alreadyReported = false,
    activities,
    collectionDetails,
    traits,
    nativeToken,
}: Properties): JSX.Element => {
    assertUser(auth.user);
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
                    className="-mt-2 mb-10 px-6 sm:mb-14 sm:px-8 lg:mb-4 2xl:px-0"
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
                />
            </DefaultLayout>
        </ExternalLinkContextProvider>
    );
};

export default CollectionsNftsView;
