import { useTranslation } from "react-i18next";
import { Button } from "@/Components/Buttons";

export const SliderFormActionsToolbar = ({
    isSaveEnabled = false,
    hasSave = true,
    onSave,
    onCancel,
    saveButtonLabel,
    cancelButtonLabel,
}: {
    hasSave?: boolean;
    isSaveEnabled?: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    saveButtonLabel?: string;
    cancelButtonLabel?: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-x-0 bottom-0 flex w-full items-center justify-between space-x-3 border-t border-theme-secondary-300 bg-white px-8 py-4 dark:border-theme-dark-700 dark:bg-theme-dark-900 xs:justify-end">
            <Button
                variant="secondary"
                onClick={onCancel}
                data-testid="SliderFormActionsToolbar__cancel"
                className="block grow xs:grow-0"
            >
                {cancelButtonLabel ?? t("common.cancel")}
            </Button>

            {hasSave && (
                <Button
                    disabled={!isSaveEnabled}
                    variant="primary"
                    data-testid="SliderFormActionsToolbar__save"
                    onClick={onSave}
                    className="block grow xs:grow-0"
                >
                    {saveButtonLabel ?? t("common.save")}
                </Button>
            )}
        </div>
    );
};
