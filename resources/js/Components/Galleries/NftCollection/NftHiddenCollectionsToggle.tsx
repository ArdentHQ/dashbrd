import cn from "classnames";
import React, { type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { Toggle } from "@/Components/Form/Toggle";

export const NftHiddenCollectionsToggle = ({
    showHidden,
    setShowHidden,
    className,
}: {
    showHidden: boolean;
    setShowHidden: Dispatch<SetStateAction<boolean>>;
    className?: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            className={cn("flex items-center gap-3", className)}
            data-testid="NftHiddenCollectionsToggle"
        >
            <span className="text-base font-medium text-theme-secondary-700 dark:text-theme-dark-200">
                {t("pages.galleries.show_hidden_collections")}
            </span>

            <Toggle
                checked={showHidden}
                onChange={() => {
                    setShowHidden(!showHidden);
                }}
            />
        </div>
    );
};
