import { type PageProps, router } from "@inertiajs/core";
import { useForm } from "@inertiajs/react";
import { type ReactNode, useEffect, useState } from "react";
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
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { useToasts } from "@/Hooks/useToasts";
import { type GalleryDraft, useWalletDraftGalleries } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import { assertWallet } from "@/Utils/assertions";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties extends PageProps {
    title: string;
    children: ReactNode;
    galleries: App.Data.Gallery.GalleriesData;
    nftCount?: number;
    showDrafts: boolean;
    galleryCount: number;
}

const Drafts = ({
    drafts,
    isLoading = false,
    onRemove,
}: {
    isLoading: boolean;
    drafts: GalleryDraft[];
    onRemove?: (id: number) => void;
}): JSX.Element => {
    const { t } = useTranslation();

    const [draftToDelete, setDraftToDelete] = useState<number | null>();

    if (isLoading) {
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
                open={isTruthy(draftToDelete)}
                onClose={() => {
                    setDraftToDelete(null);
                }}
                onConfirm={() => {
                    if (!isTruthy(draftToDelete)) {
                        return;
                    }

                    onRemove?.(draftToDelete);
                    setDraftToDelete(null);
                }}
            />
        </div>
    );
};

const StoredGalleries = ({ galleries }: Pick<Properties, "galleries">): JSX.Element => {
    const { t } = useTranslation();

    const [galleryToDelete, setGalleryToDelete] = useState<App.Data.Gallery.GalleryData | null>(null);

    const { signedAction } = useAuthorizedAction();

    const userGalleries = galleries.paginated;

    const { processing, delete: remove } = useForm({});

    const deleteHandler = (gallery: App.Data.Gallery.GalleryData): void => {
        void signedAction(() => {
            setGalleryToDelete(gallery);
        });
    };

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
                            deleteHandler(gallery);
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

const Index = ({ title, galleries, nftCount = 0, galleryCount, showDrafts, auth }: Properties): JSX.Element => {
    const { t } = useTranslation();

    assertWallet(auth.wallet);

    const { wallet } = auth;

    const { showToast } = useToasts();
    const { remove, drafts, isLoading } = useWalletDraftGalleries({ address: wallet.address });

    useEffect(() => {
        if (showDrafts && !isLoading && drafts.length === 0) {
            router.visit(route("my-galleries"));
        }
    }, [drafts, isLoading]);

    const handleDraftDelete = async (draftId: number): Promise<void> => {
        await remove(draftId);

        showToast({
            message: t("pages.galleries.my_galleries.draft_succesfully_deleted"),
        });
    };

    return (
        <Layout
            title={title}
            nftCount={nftCount}
            galleryCount={galleryCount}
            draftsCount={drafts.length}
            isLoadingDrafts={isLoading}
        >
            <div className="mx-6 pt-6 sm:mx-0 sm:pt-0">
                <div className="mb-6 hidden w-full items-center justify-between xl:flex">
                    <Heading level={1}>
                        <span className="leading-tight text-theme-secondary-800 dark:text-theme-dark-50">
                            {showDrafts ? t("common.drafts") : t("common.published")}
                        </span>
                    </Heading>

                    <CreateGalleryButton
                        nftCount={nftCount}
                        disableIfNoNfts
                    />
                </div>
            </div>

            {showDrafts && (
                <Drafts
                    isLoading={isLoading}
                    onRemove={(draftId) => {
                        void handleDraftDelete(draftId);
                    }}
                    drafts={drafts}
                />
            )}

            {!showDrafts && <StoredGalleries galleries={galleries} />}
        </Layout>
    );
};

export default Index;
