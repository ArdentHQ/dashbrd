import React from "react";
import { type Column } from "react-table";

import { Table } from "./Table";
import { TableCell } from "./TableCell";
import { TableRow } from "./TableRow";

import { render, screen, userEvent, within } from "@/Tests/testing-library";
import { type Breakpoint } from "@/Tests/utils";

const data = [
    {
        col1: "column 1",
        col2: "column 2",
        col3: "column 3",
    },
    {
        col1: "column 1",
        col2: "column 2",
        col3: "column 3",
    },
];

const columns: Array<Column<(typeof data)[number]>> = [
    {
        Header: "Header 1",
        accessor: "col1",
        minimumWidth: true,
        sortDescFirst: true,
    },
    {
        Header: "Header 2",
        accessor: "col2",
        className: "justify-end",
    },
    {
        Header: "Header 3",
        accessor: "col3",
        className: "justify-end",
    },
];

const rowMock = (): JSX.Element => <></>;

describe("Table", () => {
    it("should render", () => {
        render(
            <Table
                columns={columns}
                data={data}
                row={(row) => (
                    <TableRow>
                        <TableCell variant="start">{row.col1}</TableCell>
                        <TableCell>{row.col2}</TableCell>
                        <TableCell variant="end">{row.col3}</TableCell>
                    </TableRow>
                )}
            />,
        );

        expect(screen.getAllByRole("row")).toHaveLength(3);
        expect(screen.getAllByRole("cell")).toHaveLength(6);

        for (const tableHeader of screen.getAllByRole("columnheader")) {
            expect(tableHeader).toHaveClass("bg-theme-secondary-50");
        }
    });

    it("should render responsive", () => {
        render(
            <Table
                columns={columns}
                data={data}
                row={() => <tr />}
            />,
            { breakpoint: "xs" as Breakpoint },
        );

        // both the <table> and the wrapping <div> have the role 'table'
        expect(screen.getAllByRole("table")).toHaveLength(2);
    });

    it("should render with custom wrapper", () => {
        render(
            <Table
                columns={columns}
                data={data}
                row={() => <div />}
                customWrapper={(children: React.ReactNode) => <span data-testid="CustomWrapper">{children}</span>}
            />,
        );

        expect(screen.getByTestId("CustomWrapper")).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("should render borderless", () => {
        render(
            <Table
                variant="borderless"
                columns={columns}
                data={data}
                row={(row) => (
                    <TableRow>
                        <TableCell variant="start">{row.col1}</TableCell>
                        <TableCell>{row.col2}</TableCell>
                        <TableCell variant="end">{row.col3}</TableCell>
                    </TableRow>
                )}
            />,
        );

        expect(screen.getAllByRole("row")).toHaveLength(3);
        expect(screen.getAllByRole("cell")).toHaveLength(6);

        for (const tableHeader of screen.getAllByRole("columnheader")) {
            expect(tableHeader).not.toHaveClass("bg-theme-secondary-50");
        }
    });

    it("should render without header", () => {
        render(
            <Table
                hideHeader
                columns={columns}
                data={data}
                row={rowMock}
            />,
        );

        expect(screen.queryAllByRole("columnheader")).toHaveLength(0);
    });

    it("should render with onClick handler", () => {
        render(
            <Table
                hideHeader
                columns={columns}
                data={data}
                row={() => (
                    <TableRow onClick={vi.fn()}>
                        <td />
                    </TableRow>
                )}
            />,
        );

        for (const row of screen.getAllByTestId("TableRow")) {
            expect(row).toHaveClass("cursor-pointer");
        }
    });

    it("should render with width class applied to column header", () => {
        render(
            <Table
                columns={[
                    {
                        Header: "Header 1",
                        cellWidth: "width",
                    },
                ]}
                data={data}
                row={rowMock}
            />,
        );

        expect(screen.getByTestId("table__th--0")).toHaveClass("width");
    });

    it("should render a subset of rows", async () => {
        render(
            <Table
                columns={columns}
                data={data}
                rowsPerPage={1}
                row={() => <tr />}
            />,
        );

        await expect(within(screen.getAllByRole("rowgroup")[1]).findAllByRole("row")).resolves.toHaveLength(1);
    });

    it("should render empty table if pagination returns undefined rows", () => {
        render(
            <Table
                columns={columns}
                data={data}
                rowsPerPage={-1}
                row={() => <tr />}
            />,
        );

        expect(screen.getAllByRole("row")).toHaveLength(1);
    });

    it("should change sort order on header click", async () => {
        const onSortMock = vi.fn();

        render(
            <Table
                columns={columns}
                data={data}
                row={rowMock}
                onSort={onSortMock}
            />,
        );

        const tableHeader = screen.getAllByRole("columnheader")[0];

        expect(tableHeader.querySelector("svg#arrow-up")).toBeInTheDocument();

        await userEvent.click(tableHeader);

        expect(onSortMock).toHaveBeenCalled();
    });
});
