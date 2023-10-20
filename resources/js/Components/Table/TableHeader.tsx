/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-duplicate-string */
import cn from "classnames";
import React from "react";
import { type HeaderGroup } from "react-table";
import { type TableHeaderVariant } from "./Table.contracts";
import { Icon } from "@/Components/Icon";
import { isTruthy } from "@/Utils/is-truthy";

export const TableHeader = <RowDataType extends Record<never, unknown>>({
    headerGroups,
    variant,
    onSort,
    activeSort,
    sortDirection,
}: {
    onSort?: (column: HeaderGroup<RowDataType>) => void;
    headerGroups: Array<HeaderGroup<RowDataType>>;
    variant?: TableHeaderVariant;
    activeSort?: string;
    sortDirection?: "asc" | "desc";
}): JSX.Element => {
    const renderColumn = (column: HeaderGroup<RowDataType>, thIndex: number): JSX.Element => {
        const isSorted = activeSort != null ? column.id === activeSort : column.isSorted;

        const isSortedDesc =
            activeSort != null ? column.id === activeSort && sortDirection === "desc" : column.isSortedDesc;

        const thElementClassName = cn(
            "group relative text-sm text-left select-none border-theme-secondary-300 m-0 font-medium",
            {
                "bg-theme-secondary-50 text-theme-secondary-700 dark:bg-theme-dark-950 dark:text-theme-dark-200":
                    variant === "default" || variant === "list",
                "text-theme-secondary-500": variant === "borderless",
            },
            column.headerClassName,
            column.paddingClassName ?? "py-2 px-5 first:pl-4 last:pr-4",
            { "w-1": column.minimumWidth },
            !isTruthy(column.minimumWidth) && isTruthy(column.cellWidth)
                ? `${column.cellWidth} min-${column.cellWidth}`
                : undefined,
        );

        const rootDivClassName = cn("flex items-center flex-inline align-top", column.className, {
            "flex-row-reverse": (column.className ?? "").includes("justify-end") && !isTruthy(column.disableSortBy),
        });

        const iconDivClassName = cn(
            "flex items-center transition-colors transition-opacity rounded-full w-6 h-6 flex items-center justify-center",
            variant === "default" ? "text-theme-secondary-700" : "text-theme-secondary-500",
            { "opacity-0 group-hover:opacity-100": !isSorted },
            {
                "ml-1": !(column.className ?? "").includes("justify-end"),
                "ml-auto mr-1": (column.className ?? "").includes("justify-end"),
            },
        );

        const iconSortClassName: string = cn("transition-transform", {
            "rotate-180": (isSorted && isTruthy(isSortedDesc)) || (!isSorted && isTruthy(column.sortDescFirst)),
        });

        const toggleProperties = column.getSortByToggleProps();

        return (
            <th
                className={thElementClassName}
                data-testid={`table__th--${thIndex}`}
                {...column.getHeaderProps(toggleProperties)}
                onClick={(event) => {
                    if (isTruthy(onSort) && column.canSort) {
                        onSort(column);
                    } else {
                        toggleProperties.onClick?.(event);
                    }
                }}
            >
                <div className={rootDivClassName}>
                    <div className={cn({ "whitespace-nowrap": isTruthy(column.noWrap) })}>
                        {column.render("Header")}
                    </div>

                    {!isTruthy(column.hideSortArrow) && column.canSort && (
                        <div className={iconDivClassName}>
                            <Icon
                                role="img"
                                name="ArrowUp"
                                className={iconSortClassName}
                                size="sm"
                            />
                        </div>
                    )}
                </div>
            </th>
        );
    };

    return (
        <thead>
            {headerGroups.map((headerGroup, index) => (
                <tr
                    className="border-b border-theme-secondary-300"
                    {...headerGroup.getHeaderGroupProps()}
                    key={index}
                >
                    {headerGroup.headers.map((header, index) => renderColumn(header, index))}
                </tr>
            ))}
        </thead>
    );
};
