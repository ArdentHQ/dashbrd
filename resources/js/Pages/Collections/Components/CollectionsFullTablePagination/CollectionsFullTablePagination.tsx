import { useTranslation } from "react-i18next";
import { Pagination } from "@/Components/Pagination";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { SelectPageLimit } from "@/Components/Pagination/SelectPageLimit";

interface Properties<T> {
    pagination: PaginationData<T>;
    onPageLimitChange: (limit: number) => void;
    onPageChange: (page: number) => void;
}

export const CollectionsFullTablePagination = ({
    pagination,
    onPageLimitChange,
    onPageChange,
}: Properties<App.Data.Collections.PopularCollectionData>): JSX.Element => {
    const { t } = useTranslation();

    if (pagination.meta.total < 25) {
        return <></>;
    }

    return (
        <div className="flex w-full flex-col items-center justify-between rounded-b border-theme-secondary-300 xs:w-auto sm:space-y-0 md:w-full md:flex-row">
            <SelectPageLimit
                suffix={t("common.items")}
                value={pagination.meta.per_page}
                options={[25, 50, 100]}
                onChange={({ value }) => {
                    onPageLimitChange(Number(value));
                }}
            />
            {pagination.meta.last_page > 1 && (
                <Pagination
                    data={pagination}
                    onPageChange={(data) => {
                        onPageChange(data);
                    }}
                    className="w-full xs:w-fit"
                    responsiveBreakpoint="md"
                />
            )}
        </div>
    );
};
