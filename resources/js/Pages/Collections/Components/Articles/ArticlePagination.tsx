import { useTranslation } from "react-i18next";
import { Pagination } from "@/Components/Pagination";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { SelectPageLimit } from "@/Components/Pagination/SelectPageLimit";

interface Properties {
    pagination: PaginationData<unknown>;
    onPageLimitChange: (limit: number) => void;
}

export const ArticlePagination = ({ pagination, onPageLimitChange }: Properties): JSX.Element => {
    const { t } = useTranslation();

    if (pagination.meta.total < 12) {
        return <></>;
    }

    return (
        <div className="flex w-full flex-col items-center justify-between rounded-b border-theme-secondary-300 xs:w-auto sm:space-y-0 md:w-full md:flex-row">
            <SelectPageLimit
                suffix={t("common.items")}
                value={pagination.meta.per_page}
                options={[12, 24, 48, 96]}
                onChange={({ value }) => {
                    onPageLimitChange(Number(value));
                }}
            />
            {pagination.meta.last_page > 1 && <Pagination data={pagination} />}
        </div>
    );
};
