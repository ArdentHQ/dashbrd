import basicDark from "@images/gallery-templates/basic-dark.png";
import basic from "@images/gallery-templates/basic.png";

import { useTranslation } from "react-i18next";
import { SliderFormActionsToolbar } from "@/Components/SliderFormActionsToolbar";
import { useDarkModeContext } from "@/Contexts/DarkModeContext";

export const GallerySelectTemplate = ({
    className,
    onCancel,
}: {
    onCancel?: () => void;
    className?: string;
}): JSX.Element => {
    const { t } = useTranslation();
    const { isDark } = useDarkModeContext();

    return (
        <div data-testid="GallerySelectTemplate">
            <div
                className={className}
                data-testid="GallerySelectTemplate__wrapper"
            >
                <button
                    type="button"
                    className="w-full overflow-hidden rounded-xl text-left outline outline-1 outline-theme-primary-600 dark:outline-theme-primary-400"
                >
                    <div className="flex items-center justify-between bg-theme-primary-100 p-4 dark:bg-theme-dark-950">
                        <p className="text-sm font-medium text-theme-secondary-700 dark:text-theme-dark-200">
                            {t("pages.galleries.create.templates.basic")}
                        </p>

                        <div>
                            <span className="flex rounded-full bg-theme-primary-200 px-2 py-0.5 text-xs font-medium text-theme-primary-500 dark:bg-theme-dark-800 dark:text-theme-primary-400">
                                {t("common.selected")}
                            </span>
                        </div>
                    </div>

                    <div className="bg-theme-primary-50 p-4 dark:bg-theme-dark-800">
                        <img
                            src={isDark ? basicDark : basic}
                            alt={t("common.preview")}
                            className="w-full"
                            data-testid={`GallerySelectTemplate__basic_${isDark ? "dark" : "light"}`}
                        />
                    </div>
                </button>

                <div className="mt-3 rounded-xl border border-theme-secondary-300 p-4 text-center text-sm font-medium text-theme-secondary-700 dark:border-theme-dark-700 dark:text-theme-dark-200">
                    <p>{t("pages.galleries.create.templates.coming_soon")}</p>
                </div>
            </div>

            <SliderFormActionsToolbar onCancel={onCancel} />
        </div>
    );
};
