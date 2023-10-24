import cn from "classnames";
import React from "react";
import { type TableCellProperties, type TableCellVariant } from "./Table.contracts";

const variantClass = (variant: TableCellVariant): string | undefined => {
    if (variant === "start") {
        return "pl-4 ml-0.5 rounded-l";
    }

    if (variant === "start-list") {
        return "pl-1 md:ml-px md:pl-2.5";
    }

    if (variant === "end-list") {
        return "pr-1 md:mr-px md:pr-2.5";
    }

    if (variant === "end") {
        return "pr-4 mr-0.5 rounded-r";
    }
};

export const TableCell = ({
    innerClassName = "py-2.5",
    hoverClassName = "group-hover:bg-theme-secondary-50 dark:group-hover:bg-theme-dark-800",
    className,
    paddingClassName = "px-5",
    variant = "middle",
    children,
    ...properties
}: TableCellProperties): JSX.Element => (
    <td
        {...properties}
        data-testid="TableCell"
        className={cn("custom-table-cell", className)}
    >
        <div className="flex h-full items-center py-0.5">
            <div
                className={cn(
                    "transition-default my-0 flex h-full flex-1 items-center",
                    variantClass(variant),
                    paddingClassName,
                    innerClassName,
                    hoverClassName,
                )}
            >
                {children}
            </div>
        </div>
    </td>
);
