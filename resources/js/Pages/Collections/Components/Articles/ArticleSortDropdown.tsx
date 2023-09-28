import { useTranslation } from "react-i18next";
import { DropdownButton, SortDropdown } from "@/Pages/Collections/Components/Articles/SortDropdown";

interface Properties {
    activeSort: string | null;
    onSort: (sortBy: string) => void;
}

export const ArticleSortDropdown = ({ activeSort, onSort }: Properties): JSX.Element => {
    const { t } = useTranslation();

    return (
        <SortDropdown>
            <>
                <DropdownButton
                    isActive={activeSort === "latest"}
                    onClick={() => {
                        onSort("id");
                    }}
                >
                    {t("latest")}
                </DropdownButton>

                <DropdownButton
                    isActive={activeSort === "popularity"}
                    onClick={() => {
                        onSort("popularity");
                    }}
                >
                    {t("most-popular")}
                </DropdownButton>
            </>
        </SortDropdown>
    );
};
