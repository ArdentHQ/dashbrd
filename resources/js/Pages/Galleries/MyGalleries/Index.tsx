import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateGalleryButton } from "./Components/CreateGalleryButton";
import Layout from "./Layout";
import { NftDraftCard } from "@/Components/Drafts/NftDraftCard";
import { NftGalleryCard } from "@/Components/Galleries";
import { Heading } from "@/Components/Heading";
import { Pagination } from "@/Components/Pagination";
import { type GalleryDraft, useGalleryDrafts } from "@/Pages/Galleries/hooks/useGalleryDrafts";

const Index = ({
    title,
    galleries,
    nftCount = 0,
    galleryCount,
    showDrafts,
}: {
    title: string;
    children: ReactNode;
    galleries: App.Data.Gallery.GalleriesData;
    nftCount?: number;
    showDrafts: boolean;
    galleryCount: number;
}): JSX.Element => {
    const { t } = useTranslation();
    const [drafts, setDrafts] = useState<GalleryDraft[]>([]);

    const { getDrafts, deleteExpiredDrafts } = useGalleryDrafts();

    useEffect(() => {
        const loadDrafts = async (): Promise<void> => {
            setDrafts(await getDrafts());
        };

        void loadDrafts();
        void deleteExpiredDrafts();
    }, []);

    const userGalleries = galleries.paginated;

    return (
        <Layout
            title={title}
            nftCount={nftCount}
            galleryCount={galleryCount}
        >
            <div className="mx-6 pt-6 sm:mx-0 sm:pt-0">
                <div className="mb-6 hidden w-full items-center justify-between xl:flex">
                    <Heading level={1}>
                        <span className="leading-tight text-theme-secondary-800 dark:text-theme-dark-50">
                            {showDrafts ? t("common.drafts") : t("common.published")}
                        </span>
                    </Heading>

                    <CreateGalleryButton nftCount={nftCount} />
                </div>

                {userGalleries.meta.total === 0 && (
                    <div className="flex items-center justify-center rounded-xl border border-theme-secondary-300 p-4">
                        <span className="text-center font-medium text-theme-secondary-700">
                            {t("pages.galleries.my_galleries.no_galleries")}
                        </span>
                    </div>
                )}

                {!showDrafts && userGalleries.meta.total > 0 && (
                    <div className="-m-1 grid grid-flow-row grid-cols-1 gap-2 sm:grid-cols-2 md-lg:grid-cols-3">
                        {userGalleries.data.map((gallery, index) => (
                            <NftGalleryCard
                                key={index}
                                gallery={gallery}
                                showDeleteButton
                            />
                        ))}
                    </div>
                )}

                {showDrafts && drafts.length > 0 && (
                    <div className="-m-1 grid grid-flow-row grid-cols-1 gap-2 sm:grid-cols-2 md-lg:grid-cols-3">
                        {drafts.length > 0 &&
                            drafts.map((draft, index) => (
                                <NftDraftCard
                                    key={index}
                                    draft={draft}
                                />
                            ))}
                    </div>
                )}

                {!showDrafts && userGalleries.meta.last_page > 1 && (
                    <Pagination
                        className="my-6 flex w-full flex-col justify-center px-6 xs:items-center sm:px-8  lg:mb-0"
                        data={userGalleries}
                    />
                )}
            </div>
        </Layout>
    );
};

export default Index;
