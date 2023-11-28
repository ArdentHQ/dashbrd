import React from 'react'
import { ConfirmDeletionDialog } from '@/Components/ConfirmDeletionDialog';
import { DraftsLimitDialog } from '@/Components/Galleries/DraftsLimitDialog';
import { isTruthy } from '@/Utils/is-truthy';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';

export const MyGalleryDialogs = ({
    gallery,
    showDeleteModal,
    setShowDeleteModal,
    handleGalleryDelete,
    isBusy,
    showDraftsLimitModal,
    setShowDraftsLimitModal
}: {
    gallery?: App.Data.Gallery.GalleryData;
    showDeleteModal: boolean
    setShowDeleteModal: (show: boolean) => void
    handleGalleryDelete: (slug: string) => void
    isBusy: boolean
    showDraftsLimitModal: boolean
    setShowDraftsLimitModal: (show: boolean) => void
}): JSX.Element => {
    const {t} = useTranslation();

  return (
    <>
        {isTruthy(gallery) && (
            <ConfirmDeletionDialog
                title={t("pages.galleries.delete_modal.title")}
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                }}
                onConfirm={() => {
                    handleGalleryDelete(gallery.slug);
                }}
                isDisabled={isBusy}
            >
                {t("pages.galleries.delete_modal.confirmation_text")}
            </ConfirmDeletionDialog>
        )}

        <DraftsLimitDialog
            title={t("pages.galleries.create.drafts_limit_modal_title")}
            isOpen={showDraftsLimitModal}
            onClose={() => {
                setShowDraftsLimitModal(false);
            }}
            onCancel={() => {
                router.visit(route("my-galleries", { draft: 1 }));
            }}
            onConfirm={() => {
                setShowDraftsLimitModal(false);
            }}
        >
            {t("pages.galleries.create.drafts_limit_modal_message")}
        </DraftsLimitDialog>
    </>
  )
}
