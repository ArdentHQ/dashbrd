import { Link } from "@inertiajs/react";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { type PageLinkProperties } from "@/Components/Pagination/Pagination.contracts";
import { browserLocale } from "@/Utils/browser-locale";

export const PageLink = ({ href, page, isActive = false }: PageLinkProperties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Link
            href={href}
            className={cn(
                "transition-default flex items-center justify-center rounded-full font-medium outline-none ring-[3px] ring-transparent focus-visible:ring-theme-hint-300",
                isActive
                    ? "pointer-events-none bg-theme-hint-100 text-theme-hint-700"
                    : "text-theme-hint-900 hover:bg-theme-secondary-300",
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
        </Link>
    );
};
