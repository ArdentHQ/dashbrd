import { useTranslation } from "react-i18next";
import { DropdownButton, SortDropdown } from "@/Components/SortDropdown";

interface Properties {
    activeSort: ArticleSortBy;
    disabled: boolean;
    onSort: (sortBy: ArticleSortBy) => void;
}

export enum ArticleSortBy {
    latest = "latest",
    popularity = "popularity",
}

export const ArticleSortDropdown = ({ activeSort, onSort, disabled }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <SortDropdown disabled={disabled}>
            {({ setOpen }) => (
                <>
                    <DropdownButton
                        isActive={activeSort === ArticleSortBy.latest}
                        onClick={() => {
                            onSort(ArticleSortBy.latest);
                            setOpen(false);
                        }}
                    >
                        {t("pages.collections.articles.sort_latest")}
                    </DropdownButton>

                    <DropdownButton
                        isActive={activeSort === ArticleSortBy.popularity}
                        onClick={() => {
                            onSort(ArticleSortBy.popularity);
                            setOpen(false);
                        }}
                    >
                        {t("pages.collections.articles.sort_popularity")}
                    </DropdownButton>
                </>
            )}
        </SortDropdown>
    );
};
