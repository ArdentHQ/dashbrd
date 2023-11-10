import { useForm } from "@inertiajs/react";
import { type ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreateGalleryButton } from "./Components/CreateGalleryButton";
import Layout from "./Layout";
import { ConfirmDeletionDialog } from "@/Components/ConfirmDeletionDialog";
import { NftGalleryDraftCard } from "@/Components/Drafts/NftGalleryDraftCard";
import { EmptyBlock } from "@/Components/EmptyBlock/EmptyBlock";
import { NftGalleryCard } from "@/Components/Galleries";
import { DraftGalleryDeleteModal } from "@/Components/Galleries/GalleryPage/DraftGalleryDeleteModal";
import { Heading } from "@/Components/Heading";
import { Pagination } from "@/Components/Pagination";
import { useDraftGalleriesContext } from "@/Contexts/DraftGalleriesContext";

interface Properties {
    title: string;
    children: ReactNode;
    galleries: App.Data.Gallery.GalleriesData;
    nftCount?: number;
    showDrafts: boolean;
    galleryCount: number;
}

const Drafts = (): JSX.Element => {
    const { t } = useTranslation();

    const { drafts, deleteDraft } = useDraftGalleriesContext();

    const [draftToDelete, setDraftToDelete] = useState<number | null>(null);

    if (drafts === undefined) {
        return <></>;
    }

    if (drafts.length === 0) {
        return <EmptyBlock>{t("pages.galleries.my_galleries.no_draft_galleries")}</EmptyBlock>;
    }

    return (
        <div className="-m-1 grid grid-flow-row grid-cols-1 gap-2 sm:grid-cols-2 md-lg:grid-cols-3">
            {drafts.map((draft, index) => (
                <NftGalleryDraftCard
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

    const [galleryToDelete, setGalleryToDelete] = useState<App.Data.Gallery.GalleryData | null>(null);

    const userGalleries = galleries.paginated;

    const { processing, delete: remove } = useForm({});

    const submit = (): void => {
        if (galleryToDelete === null) {
            // Unreachable
            return;
        }

        remove(
            route("my-galleries.destroy", {
                slug: galleryToDelete.slug,
            }),
            {
                onFinish: () => {
                    setGalleryToDelete(null);
                },
            },
        );
    };

    if (userGalleries.meta.total === 0) {
        return <EmptyBlock>{t("pages.galleries.my_galleries.no_galleries")}</EmptyBlock>;
    }

    return (
        <>
            <div className="-m-1 grid grid-flow-row grid-cols-1 gap-2 sm:grid-cols-2 md-lg:grid-cols-3">
                {userGalleries.data.map((gallery, index) => (
                    <NftGalleryCard
                        key={index}
                        gallery={gallery}
                        showDeleteButton
                        onDelete={() => {
                            setGalleryToDelete(gallery);
                        }}
                    />
                ))}
            </div>

            {userGalleries.meta.last_page > 1 && (
                <Pagination
                    className="my-6 flex w-full flex-col justify-center px-6 xs:items-center sm:px-8  lg:mb-0"
                    data={userGalleries}
                />
            )}

            <ConfirmDeletionDialog
                title={t("pages.galleries.delete_modal.title")}
                isOpen={galleryToDelete !== null}
                onClose={() => {
                    setGalleryToDelete(null);
                }}
                onConfirm={submit}
                isDisabled={processing}
            >
                {t("pages.galleries.delete_modal.confirmation_text")}
            </ConfirmDeletionDialog>
        </>
    );
};

const Index = ({ title, galleries, nftCount = 0, galleryCount, showDrafts }: Properties): JSX.Element => {
    const { t } = useTranslation();

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
            </div>

            {showDrafts ? <Drafts /> : <StoredGalleries galleries={galleries} />}
        </Layout>
    );
};

export default Index;
