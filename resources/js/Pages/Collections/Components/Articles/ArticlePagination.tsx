import { Pagination } from "@/Components/Pagination";
import { type PaginationData } from "@/Components/Pagination/Pagination.contracts";
import { SelectPageLimit } from "@/Components/Pagination/SelectPageLimit";

interface Properties {
    pagination: PaginationData<unknown>;
    onPageLimitChange: (limit: number) => void;
}

export const ArticlePagination = ({ pagination, onPageLimitChange }: Properties): JSX.Element => {
    if (pagination.meta.total < 12) {
        return <></>;
    }

    return (
        <div className="mt-6 flex w-full flex-col items-center justify-between space-x-3 space-y-3 rounded-b border-theme-secondary-300 xs:w-auto sm:w-full sm:flex-row sm:space-y-0">
            <SelectPageLimit
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
