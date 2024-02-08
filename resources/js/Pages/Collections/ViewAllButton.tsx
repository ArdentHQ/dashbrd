import cn from "classnames";
import { useTranslation } from "react-i18next";
import { type RouteParams } from "ziggy-js";
import { type Filters } from "./Hooks/useCollectionFilters";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";

export const ViewAllButton = ({ className, filters }: { className?: string; filters: Filters }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <ButtonLink
            variant="secondary"
            href={route("popular-collections", filters as RouteParams)}
            className={cn("w-full justify-center sm:w-auto", className)}
        >
            {t("common.view_all")}
        </ButtonLink>
    );
};
