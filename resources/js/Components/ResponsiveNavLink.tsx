import { type Method } from "@inertiajs/core";
import { Link } from "@inertiajs/react";
import cn from "classnames";

interface Properties {
    method?: Method;
    as?: string;
    href: string;
    active?: boolean;
    children?: React.ReactNode;
}

export const ResponsiveNavLink = ({
    method = "get",
    as = "a",
    href,
    active = false,
    children,
}: Properties): JSX.Element => (
    <Link
        method={method}
        as={as}
        href={href}
        data-testid="ResponsiveNavLink"
        className={cn(
            "flex w-full items-start border-l-4 py-2 pl-3 pr-4 text-base font-medium transition duration-150 ease-in-out focus:outline-none",
            {
                "border-indigo-400 bg-indigo-50 text-indigo-700 focus:border-indigo-700 focus:bg-indigo-100 focus:text-indigo-800":
                    active,
                "border-transparent text-theme-secondary-600 hover:border-theme-secondary-300 hover:bg-theme-secondary-50 hover:text-theme-secondary-800 focus:border-theme-secondary-300 focus:bg-theme-secondary-50 focus:text-theme-secondary-800":
                    !active,
            },
        )}
    >
        {children}
    </Link>
);
