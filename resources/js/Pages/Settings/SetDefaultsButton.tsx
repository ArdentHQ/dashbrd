import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons/Button";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";
import { WarningExclamation, WarningExclamationDark } from "@/images";

interface Properties {
    onConfirm: (closeModal: () => void) => void;
    isDisabled: boolean;
}

export const SetDefaultsButton = ({ onConfirm, isDisabled }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [modalShown, setModalShown] = useState(false);
    const { isDark } = useDarkModeContext();

    return (
        <>
            <Button
                type="button"
                variant="secondary"
                className="w-1/2 items-center justify-center space-x-2 px-0 sm:w-auto sm:px-5"
                onClick={() => {
                    setModalShown(true);
                }}
            >
                <span className="whitespace-nowrap">{t("pages.settings.general.set_defaults")}</span>
            </Button>

            <ConfirmationDialog
                isOpen={modalShown}
                title={t("pages.settings.general.set_defaults")}
                confirmLabel={t("common.confirm")}
                cancelLabel={t("common.cancel")}
                isDisabled={isDisabled}
                onClose={() => {
                    setModalShown(false);
                }}
                onConfirm={() => {
                    onConfirm(() => {
                        setModalShown(false);
                    });
                }}
            >
                <div className="flex items-center justify-center">
                    {isDark ? <WarningExclamationDark /> : <WarningExclamation />}
                </div>

                <p className="mt-3 leading-6 text-theme-secondary-700 dark:text-theme-dark-200">
                    {t("pages.settings.general.set_defaults_content")}
                </p>
            </ConfirmationDialog>
        </>
    );
};
