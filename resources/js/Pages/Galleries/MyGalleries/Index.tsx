import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateGalleryButton } from "./Components/CreateGalleryButton";
import Layout from "./Layout";
import { NftDraftCard } from "@/Components/Drafts/NftDraftCard";
import { NftGalleryCard } from "@/Components/Galleries";
import { DraftGalleryDeleteModal } from "@/Components/Galleries/GalleryPage/DraftGalleryDeleteModal";
import { Heading } from "@/Components/Heading";
import { Pagination } from "@/Components/Pagination";
import { DraftGalleriesContextProvider, useDraftGalleriesContext } from "@/Contexts/DraftGalleriesContext";

interface Properties {
    title: string;
    children: ReactNode;
    galleries: App.Data.Gallery.GalleriesData;
    nftCount?: number;
    showDrafts: boolean;
    galleryCount: number;
}

const NoGalleries = ({ text }: { text: string }): JSX.Element => (
    <div className="flex items-center justify-center rounded-xl border border-theme-secondary-300 p-4">
        <span className="text-center font-medium text-theme-secondary-700">{text}</span>
    </div>
);

const Drafts = (): JSX.Element => {
    const { t } = useTranslation();

    const { drafts, deleteDraft } = useDraftGalleriesContext();

    const [draftToDelete, setDraftToDelete] = useState<number | null>(null);

    if (drafts === undefined) {
        return <></>;
    }

    if (drafts.length === 0) {
        return <NoGalleries text={t("pages.galleries.my_galleries.no_draft_galleries").toString()} />;
    }

    return (
        <div className="-m-1 grid grid-flow-row grid-cols-1 gap-2 sm:grid-cols-2 md-lg:grid-cols-3">
            {drafts.map((draft, index) => (
                <NftDraftCard
                    key={index}
                    draft={draft}
                    onDelete={() => {
                        setDraftToDelete(draft.id);
                    }}
                />
            ))}

            <DraftGalleryDeleteModal
                open={draftToDelete !== null}
                onClose={() => {
                    setDraftToDelete(null);
                }}
                onConfirm={() => {
                    void deleteDraft(draftToDelete);

                    setDraftToDelete(null);
                }}
            />
        </div>
    );
};

const StoredGalleries = ({ galleries }: Pick<Properties, "galleries">): JSX.Element => {
    const { t } = useTranslation();

    const userGalleries = galleries.paginated;

    if (userGalleries.meta.total === 0) {
        return <NoGalleries text={t("pages.galleries.my_galleries.no_galleries").toString()} />;
    }

    return (
        <>
            <div className="-m-1 grid grid-flow-row grid-cols-1 gap-2 sm:grid-cols-2 md-lg:grid-cols-3">
                {userGalleries.data.map((gallery, index) => (
                    <NftGalleryCard
                        key={index}
                        gallery={gallery}
                    />
                ))}
            </div>

            {userGalleries.meta.last_page > 1 && (
                <Pagination
                    className="my-6 flex w-full flex-col justify-center px-6 xs:items-center sm:px-8  lg:mb-0"
                    data={userGalleries}
                />
            )}
        </>
    );
};

const Index = ({ title, galleries, nftCount = 0, galleryCount, showDrafts }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <DraftGalleriesContextProvider>
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
                </div>

                {showDrafts ? <Drafts /> : <StoredGalleries galleries={galleries} />}
            </Layout>
        </DraftGalleriesContextProvider>
    );
};

export default Index;
