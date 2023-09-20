import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons/Button";
import { ConfirmationDialog } from "@/Components/ConfirmationDialog";
import { useAuth } from "@/Hooks/useAuth";
import { useAuthorizedAction } from "@/Hooks/useAuthorizedAction";
import { WarningExclamation } from "@/images";
interface Properties {
    onConfirm: (closeModal: () => void) => void;
    isDisabled: boolean;
    reset: boolean;
}

export const SetDefaultsButton = ({ onConfirm, isDisabled, reset }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const [modalShown, setModalShown] = useState(false);
    const { signedAction } = useAuthorizedAction();
    const { signed } = useAuth();

    useEffect(() => {
        if (reset && signed) {
            setModalShown(true);
        }
    }, [reset, signed]);

    const closeModal = (): void => {
        setModalShown(false);

        if (reset) {
            router.reload({
                data: {
                    reset: undefined,
                },
            });
        }
    };

    return (
        <>
            <Button
                type="button"
                variant="secondary"
                className="w-1/2 items-center justify-center space-x-2 px-0 sm:w-auto sm:px-5"
                onClick={() => {
                    signedAction(({ signed }) => {
                        setModalShown(true);

                        if (!signed) {
                            router.reload({
                                data: {
                                    reset: true,
                                },
                            });
                        }
                    });
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
                    closeModal();
                }}
                onConfirm={() => {
                    onConfirm(() => {
                        closeModal();
                    });
                }}
            >
                <div className="flex items-center justify-center">
                    <WarningExclamation />
                </div>

                <p className="mt-3 leading-6 text-theme-secondary-700">
                    {t("pages.settings.general.set_defaults_content")}
                </p>
            </ConfirmationDialog>
        </>
    );
};
