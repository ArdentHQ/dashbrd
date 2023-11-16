import { useTranslation } from "react-i18next";
import { ConfirmDeletionDialog } from "@/Components/ConfirmDeletionDialog";

export const DraftGalleryDeleteModal = ({
    open,
    onClose,
    onConfirm,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <ConfirmDeletionDialog
                data-testid="DraftGalleryDeleteModal"
                isOpen={open}
                onClose={onClose}
                title={t("pages.galleries.my_galleries.delete_modal.title")}
                onConfirm={onConfirm}
                requiresConfirmation={false}
                confirmationButtonVariant="danger"
            >
                {t("pages.galleries.my_galleries.delete_modal.text")}
            </ConfirmDeletionDialog>
        </>
    );
};
