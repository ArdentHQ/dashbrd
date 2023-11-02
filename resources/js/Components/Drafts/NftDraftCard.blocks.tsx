import { useTranslation } from "react-i18next";
import { IconButton } from "@/Components/Buttons/IconButton";
import { Icon } from "@/Components/Icon";
import { Tooltip } from "@/Components/Tooltip";

export const NftDraftFooter = (): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className="-my-1.5 flex items-center justify-between text-theme-secondary-700 dark:text-theme-dark-200"
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
                <Tooltip content={t("common.delete_draft")}>
                    <IconButton
                        icon="Trash"
                        iconClass="text-theme-primary-900 dark:text-theme-dark-200"
                        iconSize="md"
                        className="border-transparent bg-transparent dark:border-transparent"
                    />
                </Tooltip>
            </div>
        </div>
    );
};
