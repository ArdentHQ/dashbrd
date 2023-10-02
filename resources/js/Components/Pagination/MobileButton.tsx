import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
            className="transition-default flex w-full items-center justify-center space-x-4 rounded-full border border-theme-secondary-300 px-5 py-2 text-theme-secondary-700 hover:bg-theme-secondary-300 dark:border-theme-dark-700 dark:text-theme-dark-200  dark:hover:bg-theme-dark-700"
            data-testid="Pagination__MobileButton"
            {...properties}
        >
            <span data-testid="Pagination__MobileButton_text">
                {t("common.page")}{" "}
                <span className="font-medium text-theme-secondary-900 dark:text-theme-dark-50">{formattedPage}</span>{" "}
                {t("common.of")} {formattedTotalPages}
            </span>
        </button>
    );
};
