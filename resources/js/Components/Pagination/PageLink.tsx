import cn from "classnames";
import { useTranslation } from "react-i18next";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { type PageLinkProperties } from "@/Components/Pagination/Pagination.contracts";
import { browserLocale } from "@/Utils/browser-locale";

export const PageLink = ({ href, page, isActive = false, onClick }: PageLinkProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <ButtonLink
            variant="secondary"
            onClick={onClick}
            href={href}
            className={cn(
                "transition-default flex items-center justify-center rounded-full font-medium outline-none ring-[3px] ring-transparent focus-visible:ring-theme-primary-300 dark:focus-visible:ring-theme-primary-700",
                isActive
                    ? "pointer-events-none bg-theme-primary-100 text-theme-primary-700 dark:bg-theme-dark-800 dark:text-theme-dark-100"
                    : "bg-white text-theme-primary-900 hover:bg-theme-secondary-300 dark:bg-theme-dark-900 dark:text-theme-dark-100 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-200",
                page < 10 ? "h-10 w-10" : "px-4 py-2",
            )}
            data-testid="Pagination__PageLink__link"
        >
            {t("format.number", {
                value: page,
                formatParams: {
                    value: {
                        lng: browserLocale(),
                    },
                },
            })}
        </ButtonLink>
    );
};
