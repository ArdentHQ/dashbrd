import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/Components/Icon";
import { type MobileButtonProperties } from "@/Components/Pagination/Pagination.contracts";
import { browserLocale } from "@/Utils/browser-locale";

export const MobileButton = ({ page, totalPages, ...properties }: MobileButtonProperties): JSX.Element => {
    const { t } = useTranslation();

    const formatPageNumber = (value: number): string =>
        t("format.number", {
            value,
            formatParams: {
                value: {
                    lng: browserLocale(),
                },
            },
        });

    const formattedPage = useMemo(() => formatPageNumber(page), [page]);
    const formattedTotalPages = useMemo(() => formatPageNumber(totalPages), [totalPages]);

    return (
        <button
            type="button"
            className="transition-default flex items-center space-x-4 rounded-full border border-theme-secondary-300 px-5 py-2 text-theme-secondary-700 hover:bg-theme-secondary-300"
            data-testid="Pagination__MobileButton"
            {...properties}
        >
            <span data-testid="Pagination__MobileButton_text">
                {t("common.page")} <span className="font-medium text-theme-secondary-900">{formattedPage}</span>{" "}
                {t("common.of")} {formattedTotalPages}
            </span>

            <span className="text-theme-primary-900">
                <Icon name="Ellipsis" />
            </span>
        </button>
    );
};
