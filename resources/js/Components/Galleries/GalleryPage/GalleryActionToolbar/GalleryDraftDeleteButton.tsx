import { router } from "@inertiajs/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons";
import { ConfirmDeletionDialog } from "@/Components/ConfirmDeletionDialog";
import { useAuth } from "@/Contexts/AuthContext";
import { useToasts } from "@/Hooks/useToasts";
import { useWalletDraftGalleries } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import { assertWallet } from "@/Utils/assertions";

export const GalleryDraftDeleteButton = ({
    className,
    draftId,
}: {
    className?: string;
    draftId: number;
}): JSX.Element => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { showToast } = useToasts();

    const { wallet } = useAuth();

    assertWallet(wallet);

    const { remove } = useWalletDraftGalleries({ address: wallet.address });

    const deleteDraft = (): void => {
        void remove(draftId);

        router.visit(
            route("my-galleries", {
                draft: true,
            }),
            {
                onFinish: () => {
                    showToast({
                        message: t("pages.galleries.my_galleries.draft_succesfully_deleted"),
                        type: "success",
                    });
                },
            },
        );
    };

    return (
        <>
            <IconButton
                data-testid="GalleryActionToolbar__draftDelete"
                icon="Trash"
                className={className}
                onClick={() => {
                    setOpen(true);
                }}
            />

            <ConfirmDeletionDialog
                title={t("pages.galleries.my_galleries.delete_modal.title")}
                isOpen={open}
                onClose={() => {
                    setOpen(false);
                }}
                onConfirm={deleteDraft}
                requiresConfirmation={false}
                confirmationButtonVariant="danger"
            >
                {t("pages.galleries.my_galleries.delete_modal.text")}
            </ConfirmDeletionDialog>
        </>
    );
};
