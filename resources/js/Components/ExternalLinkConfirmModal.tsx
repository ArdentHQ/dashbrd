import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { Checkbox } from "@/Components/Form/Checkbox";
import { Toast } from "@/Components/Toast";

interface Properties {
    isOpen: boolean;
    onClose: () => void;
    onDisableLinkWarning?: () => void;
    hasDisabledLinkWarning?: boolean;
    href?: string;
}

export const ExternalLinkConfirmModal = ({
    isOpen,
    onClose,
    href,
    hasDisabledLinkWarning = false,
    onDisableLinkWarning,
}: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [disableLinkWarning, setDisableLinkWarning] = useState(hasDisabledLinkWarning);

    const back = (): void => {
        setDisableLinkWarning(false);
        onClose();
    };

    const followLink = (): void => {
        disableLinkWarning && onDisableLinkWarning?.();

        window.open(href, "_blank");

        back();
    };

    return createPortal(
        <ConfirmationDialog
            isOpen={isOpen}
            onClose={back}
            onConfirm={followLink}
            title={t("common.external_link")}
            cancelLabel={t("common.back")}
            confirmLabel={t("common.follow_link")}
            childrenClassName="flex flex-col pb-4"
        >
            <div className="flex-grow">
                <div
                    data-testid="ExternalLinkConfirmModal__info"
                    className="mb-4 text-theme-secondary-700 dark:text-theme-dark-200"
                >
                    {t("pages.collections.external_modal.you_wish_continue")}
                </div>

                <Toast
                    type="warning"
                    isStatic
                    isExpanded
                    message={href}
                />
            </div>

            <label className="mt-auto flex items-center space-x-3 sm:mt-4">
                <Checkbox
                    checked={disableLinkWarning}
                    onChange={() => {
                        setDisableLinkWarning(!disableLinkWarning);
                    }}
                />

                <div className="text-theme-secondary-700 dark:text-theme-dark-200">
                    {t("pages.collections.external_modal.not_show")}
                </div>
            </label>
        </ConfirmationDialog>,
        document.body,
    );
};
