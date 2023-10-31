import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";

export const NftDraftFooter = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="flex items-center justify-between text-theme-secondary-700 dark:text-theme-dark-200"
            data-testid="NftDraftCard__Footer"
        >
            <div className="flex items-center space-x-2">
                <Icon
                    name="Document"
                    size="lg"
                    className="dark:text-theme-dark-300"
                />
                <span className="text-sm text-theme-secondary-700 dark:text-theme-dark-200">{t("common.draft")}</span>
            </div>
            <div className="flex items-center space-x-2">
                <Icon
                    name="Trash"
                    size="lg"
                    className="text-theme-primary-900 dark:text-theme-dark-200"
                />
            </div>
        </div>
    );
};
