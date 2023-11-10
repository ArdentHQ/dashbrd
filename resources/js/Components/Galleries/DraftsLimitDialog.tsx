import { useTranslation } from "react-i18next";
import { type ButtonVariant } from "@/Components/Buttons";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { DeleteModal } from "@/images";

interface Properties {
    isOpen: boolean;
    onClose: () => void;
    onCancel: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    isDisabled?: boolean;
    requiresConfirmation?: boolean;
    confirmationButtonVariant?: ButtonVariant;
}

export const DraftsLimitDialog = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    children,
    title,
    confirmationButtonVariant,
}: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <ConfirmationDialog
            title={title}
            isOpen={isOpen}
            onCancel={onCancel}
            confirmLabel={t("common.continue")}
            cancelLabel={t("pages.galleries.create.drafts_limit_modal_cancel")}
            onConfirm={onConfirm}
            onClose={onClose}
            confirmationButtonVariant={confirmationButtonVariant}
        >
            <div className="space-y-3">
                <DeleteModal className="mx-auto" />

                <p className="text-theme-secondary-700 dark:text-theme-dark-200">{children}</p>
            </div>
        </ConfirmationDialog>
    );
};
