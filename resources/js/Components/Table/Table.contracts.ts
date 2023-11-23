import type React from "react";
import { type HTMLAttributes } from "react";
import { type Column, type HeaderGroup, type TableState } from "react-table";

export type TableHeaderVariant = "default" | "borderless" | "list";

export interface TableRowProperties extends HTMLAttributes<HTMLTableRowElement> {
    borderClass?: string;
}

export type TableCellVariant = "start" | "middle" | "end" | "start-list" | "end-list";

export interface TableCellProperties extends HTMLAttributes<HTMLTableCellElement> {
    hoverClassName?: string;
    innerClassName?: string;
    paddingClassName?: string;
    variant?: TableCellVariant;
}

export interface TableProperties<RowDataType extends Record<never, unknown>> {
    className?: string;
    headerClassName?: string;
    data: RowDataType[];
    columns: Array<Column<RowDataType>>;
    hideHeader?: boolean;
    initialState?: Partial<TableState<RowDataType>>;
    state?: Partial<TableState<RowDataType>>;
    rowsPerPage?: number;
    currentPage?: number;
    variant?: TableHeaderVariant;
    footer?: React.ReactNode;
    customWrapper?: (children: React.ReactNode) => JSX.Element;
    row: (data: RowDataType, index: number) => JSX.Element;
    onSort?: (column: HeaderGroup<RowDataType>) => void;
    activeSort?: string;
    sortDirection?: "asc" | "desc";
    manualSortBy?: boolean;
}

export interface TableColumn {
    cellWidth?: string;
    sortDescFirst?: boolean;
    minimumWidth?: boolean;
    disableSortBy?: boolean;
    className?: string;
    headerClassName?: string;
    paddingClassName?: string;
    hideSortArrow?: boolean;
    noWrap?: boolean;
}
