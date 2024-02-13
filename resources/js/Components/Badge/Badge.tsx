import cn from "classnames";
import { type ComponentProps } from "react";

interface Props extends ComponentProps<"span"> {
    type?: "info" | "danger";
}

export const Badge = ({ type = "info", children, className, ...props }: Props): JSX.Element => (
    <span
        data-testid="Badge"
        className={cn(
            "whitespace-nowrap rounded-xl px-2 py-0.5 text-xs leading-[1.125rem]",
            {
                "bg-theme-danger-100 text-theme-danger-600": type === "danger",
                "bg-theme-secondary-100 text-theme-secondary-500": type === "info",
            },
            className,
        )}
        {...props}
    >
        {children}
    </span>
);
