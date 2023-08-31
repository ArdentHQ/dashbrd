import { type PageProps } from "@inertiajs/core";
import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { FeaturedCollectionsBanner } from "@/Components/FeaturedCollectionsBanner";
import { GalleryControls } from "@/Components/Galleries/GalleryPage/GalleryControls";
import { GalleryCurator } from "@/Components/Galleries/GalleryPage/GalleryCurator";
import { GalleryHeading } from "@/Components/Galleries/GalleryPage/GalleryHeading";
import { GalleryNfts } from "@/Components/Galleries/GalleryPage/GalleryNfts";
import { useNetworks } from "@/Hooks/useNetworks";
import { DefaultLayout } from "@/Layouts/DefaultLayout";
import { assertUser } from "@/Utils/assertions";

interface Properties {
    title: string;
    auth: PageProps["auth"];
    gallery: App.Data.Gallery.GalleryData;
    stats: App.Data.Gallery.GalleryStatsData;
    collections: App.Data.Nfts.NftCollectionData[];
    alreadyReported: boolean;
    reportAvailableIn?: string | null;
}

const GalleriesView = ({
    auth,
    gallery,
    stats,
    collections,
    title,
    alreadyReported,
    reportAvailableIn,
}: Properties): JSX.Element => {
    assertUser(auth.user);

    const { getByChainId, network } = useNetworks();
    const { props } = usePage();

    useEffect(() => {
        void getByChainId(gallery.nfts.paginated.data.at(0)?.chainId);
    }, []);

    return (
        <DefaultLayout
            auth={auth}
            toastMessage={props.toast}
        >
            <Head title={title} />

            <div className="mx-6 sm:mx-8 2xl:mx-0">
                <GalleryHeading
                    name={gallery.name}
                    value={gallery.value}
                    nftsCount={stats.nfts}
                    collectionsCount={stats.collections}
                    currency={auth.user.attributes.currency}
                />

                <GalleryControls
                    reportReasons={props.reportReasons}
                    network={network}
                    likesCount={stats.likes}
                    wallet={gallery.wallet}
                    gallery={gallery}
                    alreadyReported={alreadyReported}
                    reportAvailableIn={reportAvailableIn}
                />

                <GalleryNfts nfts={gallery.nfts.paginated.data} />

                <div className="mt-4 hidden justify-center sm:flex md:hidden">
                    <GalleryCurator
                        network={network}
                        wallet={gallery.wallet}
                        truncate={false}
                        className="w-auto"
                    />
                </div>

                <div className="mt-4 flex justify-center sm:hidden">
                    <GalleryCurator
                        wallet={gallery.wallet}
                        className="w-auto"
                    />
                </div>

                <div className="pt-6">
                    <FeaturedCollectionsBanner collections={collections} />
                </div>
            </div>
        </DefaultLayout>
    );
};

export default GalleriesView;
