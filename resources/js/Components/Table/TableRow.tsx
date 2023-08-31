import cn from "classnames";
import React, { forwardRef } from "react";
import { type TableRowProperties } from "./Table.contracts";

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProperties>(
    (
        {
            className,
            borderClass = "group border-b last:border-b-0 border-theme-secondary-300 border-dashed",
            onClick,
            ...properties
        }: TableRowProperties,
        reference,
    ): JSX.Element => {
        const hasClickHandler = onClick !== undefined;

        const cursorStyles = (): string | undefined => {
            if (hasClickHandler) {
                return "cursor-pointer";
            }
        };

        return (
            <tr
                ref={reference}
                data-testid="TableRow"
                {...properties}
                onClick={onClick}
                className={cn("h-0", borderClass, cursorStyles(), className, { group: hasClickHandler })}
            />
        );
    },
);

TableRow.displayName = "TableRow";
