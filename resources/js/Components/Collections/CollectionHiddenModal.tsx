import { router } from "@inertiajs/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { WarningExclamation } from "@/images";

interface Properties {
    collection: App.Data.Collections.CollectionDetailData;
    previousUrl?: string;
}

export const CollectionHiddenModal = ({ collection, previousUrl }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(true);
    const [error, setError] = useState("");

    const unhide = (): void => {
        setLoading(true);
        setError("");

        router.delete(route("hidden-collections.destroy", collection.address), {
            onSuccess: () => {
                setOpen(false);
                setLoading(false);
            },
            onError: () => {
                setError(t("pages.collections.hidden_modal.error"));
                setLoading(false);
            },
        });
    };

    return (
        <ConfirmationDialog
            isOpen={open}
            onClose={(): void => {
                router.get(previousUrl ?? route("collections"));
            }}
            onConfirm={unhide}
            title={t("pages.collections.hidden_modal.collection_hidden")}
            cancelLabel={t("common.back")}
            confirmLabel={t("pages.collections.hidden_modal.unhide")}
            isDisabled={loading}
            hasBlurryOverlay
        >
            <div className="flex items-center justify-center">
                <WarningExclamation />
            </div>

            <p
                data-testid="CollectionHiddenModal__description"
                className="mt-3 leading-6 text-theme-secondary-700 dark:text-theme-dark-200"
            >
                {t("pages.collections.hidden_modal.description")}
            </p>

            {error.length > 0 && (
                <p
                    className="mt-4 text-sm text-theme-danger-500"
                    data-testid="CollectionHiddenModal__error"
                >
                    {error}
                </p>
            )}
        </ConfirmationDialog>
    );
};
