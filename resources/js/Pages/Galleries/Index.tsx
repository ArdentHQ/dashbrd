import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GalleriesHeading } from "./Components/GalleriesHeading";
import GalleryGuestBanner from "./Components/GalleryGuestBanner";
import { GallerySkeleton } from "./Components/GallerySkeleton/GallerySkeleton";
import { useGalleryCarousel } from "./hooks/use-gallery-carousel";
import { Carousel, CarouselItem } from "@/Components/Carousel";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { NftGalleryCard } from "@/Components/Galleries";
import { useMetaMaskContext } from "@/Contexts/MetaMaskContext";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { DefaultLayout } from "@/Layouts/DefaultLayout";

interface Properties {
    title: string;
    stats: App.Data.Gallery.GalleriesStatsData;
}

interface Galleries {
    popular: App.Data.Gallery.GalleryData[];
    newest: App.Data.Gallery.GalleryData[];
    mostValuable: App.Data.Gallery.GalleryData[];
}

const GalleriesIndex = ({ stats, title }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const { initialized, connecting } = useMetaMaskContext();

    const { signedAction } = useAuthorizedAction();

    const guestBannerClickHandler = (): void => {
        signedAction(() => {
            router.visit(
                route("my-galleries.create", {
                    redirectTo: "my-galleries.create",
                }),
            );
        });
    };

    const { props } = usePage();
    const { slidesPerView, horizontalOffset } = useGalleryCarousel();

    const [galleries, setGalleries] = useState<Galleries>();

    const isEmpty = galleries !== undefined && galleries.popular.length === 0;

    const loadGalleries = async (): Promise<void> => {
        const { data } = await axios.get<Galleries>(route("galleries.galleries"));

        setGalleries(data);
    };

    useEffect(() => {
        void loadGalleries();
    }, []);

    return (
        <DefaultLayout toastMessage={props.toast}>
            <Head title={title} />
            <div>
                <div className="mx-6 sm:mx-8 2xl:mx-0">
                    <GalleriesHeading
                        galleriesCount={stats.galleries}
                        collectionsCount={stats.collections}
                        nftsCount={stats.nfts}
                        usersCount={stats.users}
                    />
                </div>

                <GalleryGuestBanner
                    onClick={guestBannerClickHandler}
                    initialized={initialized}
                    connecting={connecting}
                />

                {galleries === undefined ? (
                    <div className="mt-5 space-y-9">
                        <GallerySkeleton
                            title={t("pages.galleries.most_popular_galleries")}
                            viewAllPath={route("galleries.most-popular")}
                        />
                        <GallerySkeleton
                            title={t("pages.galleries.newest_galleries")}
                            viewAllPath={route("galleries.newest")}
                        />
                        <GallerySkeleton
                            title={t("pages.galleries.most_valuable_galleries")}
                            viewAllPath={route("galleries.most-valuable")}
                        />
                    </div>
                ) : (
                    <>
                        {isEmpty && (
                            <div className="mx-6 mt-5 sm:mx-8 2xl:mx-0">
                                <EmptyBlock>{t("pages.galleries.empty_title")}</EmptyBlock>
                            </div>
                        )}

                        {!isEmpty && (
                            <div className="mt-5 space-y-9">
                                <Carousel
                                    horizontalOffset={horizontalOffset}
                                    headerClassName="mx-6 sm:mx-8 2xl:mx-0"
                                    swiperClassName="-m-1 lg:mx-7 2xl:-m-1"
                                    spaceBetween={8}
                                    slidesPerView={slidesPerView}
                                    title={t("pages.galleries.most_popular_galleries")}
                                    viewAllPath={route("galleries.most-popular")}
                                >
                                    {galleries.popular.map((gallery, index) => (
                                        <CarouselItem key={index}>
                                            <NftGalleryCard gallery={gallery} />
                                        </CarouselItem>
                                    ))}
                                </Carousel>

                                <Carousel
                                    horizontalOffset={horizontalOffset}
                                    headerClassName="mx-6 sm:mx-8 2xl:mx-0"
                                    swiperClassName="-m-1 lg:mx-7 2xl:-m-1"
                                    slidesPerView={slidesPerView}
                                    spaceBetween={8}
                                    carouselKey="2"
                                    title={t("pages.galleries.newest_galleries")}
                                    viewAllPath={route("galleries.newest")}
                                >
                                    {galleries.newest.map((gallery, index) => (
                                        <CarouselItem key={index}>
                                            <NftGalleryCard gallery={gallery} />
                                        </CarouselItem>
                                    ))}
                                </Carousel>

                                <Carousel
                                    horizontalOffset={horizontalOffset}
                                    headerClassName="mx-6 sm:mx-8 2xl:mx-0"
                                    swiperClassName="-m-1 lg:mx-7 2xl:-m-1"
                                    slidesPerView={slidesPerView}
                                    spaceBetween={8}
                                    carouselKey="3"
                                    title={t("pages.galleries.most_valuable_galleries")}
                                    viewAllPath={route("galleries.most-valuable")}
                                >
                                    {galleries.mostValuable.map((gallery, index) => (
                                        <CarouselItem key={index}>
                                            <NftGalleryCard gallery={gallery} />
                                        </CarouselItem>
                                    ))}
                                </Carousel>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DefaultLayout>
    );
};

export default GalleriesIndex;
