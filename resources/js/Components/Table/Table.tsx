import { chunk } from "@ardenthq/sdk-helpers";
import cn from "classnames";
import React, { useEffect, useMemo } from "react";
import { type Row, useSortBy, useTable } from "react-table";

import { type TableProperties } from "./Table.contracts";
import { TableHeader } from "./TableHeader";
import { isTruthy } from "@/Utils/is-truthy";

export const Table = <RowDataType extends Record<never, unknown>>({
    footer,
    data,
    columns,
    hideHeader = false,
    className,
    headerClassName,
    initialState,
    rowsPerPage,
    currentPage = 1,
    manualSortBy = false,
    variant = "default",
    customWrapper,
    row,
    activeSort,
    sortDirection = "asc",
    onSort,
    ...properties
}: TableProperties<RowDataType>): JSX.Element => {
    const tableData = useMemo(() => data, [data]);
    const tableColumns = useMemo(() => columns, [columns]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, setSortBy } = useTable<RowDataType>(
        {
            autoResetSortBy: false,
            columns: tableColumns,
            data: tableData,
            disableSortRemove: true,
            initialState,
            manualSortBy,
        },
        useSortBy,
    );

    useEffect(() => {
        if (!manualSortBy || activeSort == null) {
            return;
        }

        setSortBy([{ id: activeSort, desc: sortDirection === "desc" }]);
    }, [activeSort, sortDirection, manualSortBy]);

    const rowsList = useMemo(() => {
        if (!isTruthy(rowsPerPage) || rows.length === 0) {
            return rows;
        }

        return chunk(rows, rowsPerPage)[currentPage - 1] ?? [];
    }, [currentPage, rows, rowsPerPage]);

    const createRow = (tableRow: Row<RowDataType>, index: number): JSX.Element => {
        prepareRow(tableRow);
        return { ...tableRow.getRowProps(), ...row(tableRow.original, index), key: String(index) };
    };

    if (customWrapper !== undefined) {
        return customWrapper(rowsList.map((tableRow, index) => createRow(tableRow, index)));
    }

    return (
        <div
            className={cn({
                "rounded-xl border border-theme-secondary-300 dark:border-theme-dark-700": variant === "default",
                "border-none": variant === "borderless",
            })}
        >
            <div
                {...properties}
                {...getTableProps({ className })}
                className={cn("overflow-hidden", {
                    "rounded-xl": variant === "default",
                    "table-list": variant === "list",
                })}
            >
                <table
                    cellPadding={0}
                    className="m-0 w-full table-auto p-0"
                >
                    {!hideHeader && (
                        <TableHeader
                            headerGroups={headerGroups}
                            variant={variant}
                            onSort={onSort}
                            activeSort={activeSort}
                            sortDirection={sortDirection}
                            className={headerClassName}
                        />
                    )}

                    <tbody {...getTableBodyProps()}>
                        {rowsList.map((tableRow, index) => createRow(tableRow, index))}
                    </tbody>
                </table>
            </div>

            {footer}
        </div>
    );
};
