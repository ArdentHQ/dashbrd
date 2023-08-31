import basic from "@images/gallery-templates/basic.png";

import { useTranslation } from "react-i18next";
import { SliderFormActionsToolbar } from "@/Components/SliderFormActionsToolbar";

export const GallerySelectTemplate = ({
    className,
    onCancel,
}: {
    onCancel?: () => void;
    className?: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div>
            <div className={className}>
                <button
                    type="button"
                    className="w-full overflow-hidden rounded-xl text-left outline outline-1 outline-theme-hint-600"
                >
                    <div className="flex items-center justify-between bg-theme-hint-100 p-4">
                        <p className="text-sm font-medium text-theme-secondary-700">
                            {t("pages.galleries.create.templates.basic")}
                        </p>

                        <div>
                            <span className="flex rounded-full bg-theme-hint-200 px-2 py-0.5 text-xs font-medium text-theme-hint-500">
                                {t("common.selected")}
                            </span>
                        </div>
                    </div>

                    <div className="bg-theme-hint-50 p-4">
                        <img
                            src={basic}
                            alt={t("common.preview")}
                            className="w-full"
                        />
                    </div>
                </button>

                <div className="mt-3 rounded-xl border border-theme-secondary-300 p-4 text-center text-sm font-medium text-theme-secondary-700">
                    <p>{t("pages.galleries.create.templates.coming_soon")}</p>
                </div>
            </div>

            <SliderFormActionsToolbar onCancel={onCancel} />
        </div>
    );
};
